import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from clone.format_data  import unescape_html


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



def send_emails(subject, sender_email, sender_password, SMTP_SERVER, SMTP_PORT, target_list, email_template):

    email_html_content = read_file(email_template)
    
    if isinstance(target_list, list):
        # Multiple target_list
        for recipient in target_list:
            
            receiver_email = recipient['email']
            user_id = recipient['user_id']
            #replace email and id of user
            email_personalized_content = email_html_content.replace('[someone@example.com]', receiver_email).replace('[userid]', user_id)
            
            message = create_email_message(subject, sender_email, receiver_email, email_personalized_content)
            
            send_email(SMTP_SERVER, SMTP_PORT, sender_email, sender_password, message)
