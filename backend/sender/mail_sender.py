import os
import smtplib
import dns.resolver
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from clone.format_data  import unescape_html
from result.xlsx import edit_exel_file
from api.tracker import get_status_counts, get_result_by_target_id, update_status_counts
from api.models import db, Target


path = "/Users/souliya/Desktop/Project Phishing/backend/result/"

def verify_email_smtp(email):
    domain = email.split("@")[1]
    mx_record = None
    try:
        records = dns.resolver.resolve(domain, "MX")
        mx_records = records[0].exchange
        mx_record = str(mx_records)
    except Exception as e:
        print(f"Could not find MX record for domain {domain}: {e}")
        return False

    try:
        server = smtplib.SMTP()
        server.set_debuglevel(0)

        server.connect(mx_record)
        server.helo(server.local_hostname)

        server.mail("some@gmail.com")
        code, message = server.rcpt(email)
        server.quit()

        if code == 250:
            return True
        else:
            print(f"Failed with response code {code}: {message}")
            return False

    except Exception as e:
        print(f"SMTP verification failed for {email}: {e}")
        return False



def read_file(file_path):
    """Read and return the content of the HTML template file."""
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()

def create_email_message(subject, sender_email, receiver_email, html_content):
    """Create an email message with the provided HTML content."""
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg.attach(MIMEText(html_content, 'html'))
    return msg


def send_email(smtp_server, smtp_port, sender_email, sender_password, message):
    """Send an email using the specified SMTP server and credentials."""
    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls() 
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, message['To'], message.as_string())
        print(f"Email sent successfully to {message['To']}!")
    except Exception as e:
        print(f"Error: {e}")



def send_emails(subject, sender_email, sender_password, SMTP_SERVER, SMTP_PORT, target_list, email_template, file_path):

    
    if isinstance(target_list, list):
        # Multiple target_list
        for recipient in target_list:
            receiver_email = recipient['email']
            user_id = recipient['user_id']
            
            db_result = get_result_by_target_id(db, user_id)
            if not verify_email_smtp(receiver_email):
                #count error email resualt status
                counts = get_status_counts(db_result.status)
                db_result.status = update_status_counts(counts, 5)
                
                #update target status
                db_target = db.session.query(Target).filter_by(id = user_id).first()
                db_target.status = "Error"
                db.session.commit()
                
                edit_exel_file(file_path, receiver_email,  8  , char="✗")
                
                
            else:
                #count success sent email resualt statuus
                counts = get_status_counts(db_result.status)
                db_result.status = update_status_counts(counts, 1)
                db.session.commit()
                
            email_template = unescape_html(email_template)
            #replace email and id of user
            email_personalized_content = email_template.replace('[someone@example.com]', receiver_email).replace('[userid]', str(user_id))
            
            message = create_email_message(subject, sender_email, receiver_email, email_personalized_content)
            
            send_email(SMTP_SERVER, SMTP_PORT, sender_email, sender_password, message)
