import os
import socket
from flask import request, jsonify, make_response, render_template
from flask_restx import  Namespace, Resource

from result.xlsx import edit_exel_file
from api.models import Group, Target, Page, Campaign, t_grouptarget,Result, db
from constans.http_status_code import (
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
)

tracker_ns = Namespace("tracker", description="Track email operations")




# Helper functions to manage status counts
def get_status_counts(status):
    counts = status.split(' | ')
    return list(map(int, counts))

def update_status_counts(counts, index):
    counts[index] += 1
    return ' | '.join(map(str, counts))

def get_result_by_target_id(db, target_id):
    try:
        # Query to get the result ID
        result = (
            db.session.query(Result.rid)
            .join(Campaign, Campaign.cam_id == Result.cam_id)
            .join(Group, Group.camp_id == Campaign.cam_id)
            .join(t_grouptarget, t_grouptarget.c.groupid == Group.id)
            .join(Target, t_grouptarget.c.targetid == Target.id)
            .filter(Target.id == target_id)
            .first()
        )

        # If result not found, return 404 response
        if not result:
            return make_response(jsonify({"error": "Target ID not found"}), HTTP_404_NOT_FOUND)
        
        # Query to get the full result record
        db_result = db.session.query(Result).filter(Result.rid == result.rid).first()
        return db_result
    
    except Exception as e:
        return make_response(jsonify({"error": str(e)}), 500)


def get_campaign_by_target_id(db, target_id):
    campaign = (
        db.session.query(Campaign.cam_id)
        .join(Group, Group.camp_id == Campaign.cam_id)
        .join(t_grouptarget, t_grouptarget.c.groupid == Group.id)
        .join(Target, t_grouptarget.c.targetid == Target.id)
        .filter(Target.id == target_id)
        .first()
    )
    if not campaign:
        return make_response(jsonify({"error": "Target ID not found"}), HTTP_404_NOT_FOUND)
    db_campaign = db.session.query(Campaign).filter(Campaign.cam_id == campaign.cam_id).first()

    return db_campaign

def get_client_ip():
    if request.headers.get('X-Forwarded-For'):
        ip = request.headers.get('X-Forwarded-For').split(',')[0]
    else:
        ip = request.remote_addr
    return ip

def get_host_name(ip_address):
    try:
        host_name = socket.gethostbyaddr(ip_address)[0]
    except (socket.herror, socket.gaierror):
        host_name = "Unknown"
    return host_name





    
@tracker_ns.route("/open")
class Tracker_click(Resource):

    def get(self):
        target_id = request.args.get('id')
        if not target_id:
            return make_response(jsonify({"error": "Target ID is required"}), HTTP_400_BAD_REQUEST)
        
        db_result = get_result_by_target_id(db, target_id)

        counts = get_status_counts(db_result.status)
        db_result.status = update_status_counts(counts, 2)
        db.session.commit()
        
        db_target = db.session.query(Target).filter_by(id = target_id).first()
        receiver_email = db_target.email
        db_campaign = get_campaign_by_target_id(db, target_id)
        cam_name = db_campaign.cam_name
        file_path = f"/Users/souliya/Desktop/Project Phishing/backend/result/{cam_name}_result.xlsx"
        edit_exel_file(file_path, receiver_email, 5 , char="✓")
        
        
        return  make_response(jsonify({"status": db_result.status}))



@tracker_ns.route("/click")
class Tracker_open(Resource):
    def get(self):
        target_id = request.args.get('id')
        if not target_id:
            return make_response(jsonify({"error": "Target ID is required"}), HTTP_400_BAD_REQUEST)

        #count click
        db_result = get_result_by_target_id(db, target_id)
        
        counts = get_status_counts(db_result.status)
        db_result.status = update_status_counts(counts, 3)
        db.session.commit()

        db_campaign = get_campaign_by_target_id(db, target_id)
        cam_name = db_campaign.cam_name
        db_target = db.session.query(Target).filter_by(id = target_id).first()
        receiver_email = db_target.email
        file_path = f"/Users/souliya/Desktop/Project Phishing/backend/result/{cam_name}_result.xlsx"
        edit_exel_file(file_path, receiver_email, 6 , char="✓")
        
        
        
        #render template
        page_id = db_campaign.page_id
        
        page_id_result = db.session.query(Page.path).filter(Page.page_id == page_id).first()
        page_path = page_id_result.path
        
        #Render template with path
        if page_path:
            page_path = os.path.basename(page_path)
            
            rendered_html = render_template(page_path)              #it can pass parameters in to the template
            response = make_response(rendered_html)
            response.headers['Content-Type'] = 'text/html'
            return response               
        else:
            return make_response(jsonify({"error": "No campaign found for the given target ID"}), HTTP_400_BAD_REQUEST)
        
        
        

@tracker_ns.route("/send")
class Tracker_send(Resource):
    def get(self):
        recv_data = request.args.get('email') + request.args.get('password')
        session = request.args.get('session')
        ip_address = get_client_ip()
        host_name = get_host_name(ip_address)
        target_id = request.args.get('id')
        
        
        recv_data = "*" * len(recv_data)
        
        
        if not target_id:
            return make_response(jsonify({"error": "Target ID is required"}), HTTP_400_BAD_REQUEST)
        
        #result column
        db_result = get_result_by_target_id(db, target_id)
        
        counts = get_status_counts(db_result.status)
        db_result.status = update_status_counts(counts, 4)
        
        db_target = db.session.query(Target).filter_by(id = target_id).first()
        db_target.ip_addr = ip_address
        db_target.hostname = host_name
        db_target.recv_data = recv_data
        db_target.sess_id = session
        db_target.status = "Success"
        
        db.session.commit()
        
        receiver_email = db_target.email
        db_campaign = get_campaign_by_target_id(db, target_id)
        cam_name = db_campaign.cam_name
        file_path = f"/Users/souliya/Desktop/Project Phishing/backend/result/{cam_name}_result.xlsx"
        edit_exel_file(file_path, receiver_email, 7 , char="✓")
        
        
        return None