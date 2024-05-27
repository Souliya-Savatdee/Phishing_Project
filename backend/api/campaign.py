import re
from datetime import datetime
import random
from flask import request, jsonify, make_response
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import get_jwt, jwt_required

from api.models import db, Group, Target, User, Smtp, Template, Page, Campaign, Result
from sender.mail_sender import send_emails
from constans.http_status_code import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
)

campaign_ns = Namespace("campaign", description="Campaign management operations")

campaign_model = campaign_ns.model(
    "Template",
    {
        "cam_id" : fields.Integer(),
        "cam_name": fields.String(),
        "status": fields.String(),
        "created_date": fields.DateTime(),
        "completed_date": fields.DateTime(),
        "launch_date": fields.DateTime(),
        "send_data": fields.DateTime(),
        "user_id": fields.Integer(),
        "group_id": fields.Integer(),
        "page_id": fields.Integer(),
        "temp_id": fields.Integer(),
        "smtp_id": fields.Integer(),
    },
)

def check_admin_permission():
    jwt = get_jwt()
    if jwt["role"] != "admin":
        return make_response(
            jsonify({"msg": "Permission denied"}), HTTP_400_BAD_REQUEST
        )


def validate_strip(profile_name, name):
    if profile_name.strip() == "":
        return make_response(
            jsonify({"msg": f"No {name} provided"}), HTTP_400_BAD_REQUEST
        )

@campaign_ns.route("/")
class CampaignManagments(Resource):


    # @jwt_required()
    @campaign_ns.expect(campaign_model)
    def post(self):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check
        
        data = request.get_json()
        cam_name = data.get("cam_name")
        # status = data.get("status")
        user_id = data.get("user_id")
        group_id = data.get("group_id")
        page_id = data.get("page_id")
        temp_id = data.get("temp_id")
        smtp_id = data.get("smtp_id")
        send_data = data.get("send_data")
        # launch_date = data.get("launch_date")
        completed_date = data.get("completed_date")
        
        # validate empty fields
        
        if not user_id:
            return make_response(
                jsonify({"msg": "No user belong provided"}), HTTP_400_BAD_REQUEST
            )
        
        if not completed_date:
            return make_response(
                jsonify({"msg": "No End date provided"}), HTTP_400_BAD_REQUEST
            )
            
        
        db_User = db.session.query(User).filter_by(id = user_id).first()
        email = db_User.email
        
        db_group = db.session.query(Group).filter_by(id = group_id).first()
        targets = []
        group_name = db_group.groupname
        for target in db_group.target:
            targets.append(
                {
                    "email": target.email,
                    "user_id": target.id
                }
            )
        
        db_page = db.session.query(Page).filter_by(page_id = page_id).first()
        page_path = db_page.path
        
        db_template = db.session.query(Template).filter_by(temp_id = temp_id).first()
        subject = db_template.temp_subject
        text = db_template.temp_text
        html = db_template.temp_html
        if not text:
            email_template = html
        else:
            email_template = text
        
        db_smtp = db.session.query(Smtp).filter_by(smtp_id = smtp_id).first()
        smtp_username = db_smtp.username
        smtp_password =  db_smtp.password
        smtp_sender = db_smtp.from_address
        smtp_host, smtp_port = (db_smtp.host).split(':')
        
        # send_emails(subject, smtp_sender, smtp_password, smtp_host, smtp_port, targets, email_template)
        
        current_date = datetime.now()
        cam_id = random.randint(100, 10000)
        
        new_campaign = Campaign(
            cam_id = cam_id,
            cam_name = cam_name, 
            # status = status,
            user_id = user_id,
            group_id = group_id,
            page_id = page_id,
            temp_id = temp_id,
            smtp_id = smtp_id,
            launch_date = current_date,
            completed_date = completed_date,
            created_date = current_date,
            send_data = send_data,
        )
        new_resualt = Result(

                email = "admin@admin.com",
                cam_id = cam_id,
        )
        
        db_update_group_cam_id = db.session.query(Group).filter_by(id = group_id).first()
        
        db.session.add(new_campaign)
        db.session.add(new_resualt)
        db_update_group_cam_id.camp_id = cam_id
        
        db.session.commit()
        return make_response(
            jsonify({"msg": "Campaign created successfully "}), HTTP_201_CREATED
        )
        
        
        
        
        
        
        
        
        
        
        
        
        
        
    # @jwt_required()
    def get(self):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check
        
        db_campaign = db.session.query(Campaign).all()
        data = []
        for campaign in db_campaign:
            if campaign.modified_date:
                launch_date = campaign.launch_date.strftime('%Y-%m-%d')
            else:
                launch_date = None
        data.append(
            {
                "cam_id" : campaign.cam_id,
                "cam_name": campaign.cam_name,
                "launch_date": launch_date,
                "status": campaign.status
            }
        )        
        
        return make_response(jsonify({"campaign":data}), HTTP_200_OK)
            
            
            
@campaign_ns.route("/<int:id>")
class CampaignManagment(Resource):
    def delete(self, id):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check
        
        db_campaign = db.session.query(Campaign).filter_by(cam_id = id).first()
        db.session.delete(db_campaign)
        db.session.commit()
        return make_response(
            jsonify({"msg": "Campaign deleted successfully "}), HTTP_200_OK
        )