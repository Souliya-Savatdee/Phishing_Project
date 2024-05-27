from datetime import datetime
from flask import request, jsonify, make_response
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import get_jwt, jwt_required
from template.text_to_html import text_to_html

from constans.http_status_code import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
)
from api.models import Template, db

email_template_ns = Namespace("email_template", description="Email Template operations")


email_template_model = email_template_ns.model(
    "Template",
    {
        "id": fields.Integer(),
        "name": fields.String(),
        "subject": fields.String(),
        "text": fields.String(),
        "html": fields.String(),
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
        


@email_template_ns.route("/")
class TemplateManagments(Resource):
    # @jwt_required()
    @email_template_ns.expect(email_template_model)
    def post(self):

        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check

        data = request.get_json()
        name = data.get("name")
        subject = data.get("subject")
        text = data.get("text")
        html = data.get("html")

        # validate empty fields
        validate_name = validate_strip(name, "template name")
        if validate_name:
            return validate_name
        
        validate_subject = validate_strip(subject, "subject")
        if validate_subject:
            return validate_subject

        if text.strip() == "" and html.strip() == "":
            return make_response(jsonify({"msg": "html or text not provided"}), HTTP_400_BAD_REQUEST)
        if text and html :
            return make_response(jsonify({"msg": "Invalid both, choose one"}), HTTP_400_BAD_REQUEST)
        if text.strip() == ""and html :
            text = None
        else:
            text = text_to_html(text)
            html = None
            
        db_template = db.session.query(Template).filter_by(temp_name = name).first()

        if db_template is not None:
            return make_response(
                jsonify({"msg": "Email Tempalte name already taken"}), HTTP_409_CONFLICT
            )
        

        new_template = Template(
            temp_name = name, 
            temp_subject = subject,
            temp_text = text,
            temp_html = html
        )
        db.session.add(new_template)
        db.session.commit()

        return make_response(
            jsonify({"msg": "Email Template Created"}), HTTP_201_CREATED
        )

    # @jwt_required()
    def get(self):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check

        db_templates = db.session.query(Template).all()
        data = []
        for templates in db_templates:
            if templates.modified_date:
                modifile_date = templates.modified_date.strftime('%Y-%m-%d')
            else:
                modifile_date = None

            data.append(
                {
                    "id": templates.temp_id,
                    "name": templates.temp_name,
                    "subject": templates.temp_subject,
                    "text": templates.temp_text,
                    "html": templates.temp_html,
                    "modified_date": modifile_date,
                }
            )

        return make_response(jsonify({"email_template": data}), HTTP_200_OK)


@email_template_ns.route("/<int:id>")
class TemplateManagment(Resource):
    # @jwt_required()
    def delete(self, id):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check

        db_templates = db.session.query(Template).filter_by(temp_id=id).first()

        if not db_templates:
            return make_response(
                jsonify({"msg": "Email Template not found"}), HTTP_404_NOT_FOUND
            )

        db.session.delete(db_templates)
        db.session.commit()

        return make_response(jsonify({"msg": "Email Template Deleted"}), HTTP_200_OK)

    # @jwt_required()
    def put(self, id):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check

        data = request.get_json()
        temp_name = data.get("name")
        temp_subject = data.get("subject")
        temp_text = data.get("text")
        temp_html = data.get("html")

        # validate empty fields
        validate_name = validate_strip(temp_name, "template name")
        if validate_name:
            return validate_name
        
        if temp_subject.strip() == "" and temp_html.strip() == "" and temp_text.strip() == "":
            db_temp = db.session.query(Template).filter(Template.temp_name == temp_name, Template.temp_id != id).first()
            if db_temp:
                return make_response(
                    jsonify({"msg": "Template name already taken"}), HTTP_409_CONFLICT
                )
            current_datetime = datetime.now()
            
            db_tem = db.session.query(Template).filter_by(temp_id = id).first()
            db_tem.temp_name = temp_name
            db_tem.modified_date = current_datetime
            db.session.commit()

            return make_response(jsonify({"msg": "Email Template Updated"}), HTTP_200_OK)

        validate_subject = validate_strip(temp_subject, "subject")
        if validate_subject:
            return validate_subject

        db_templates = db.session.query(Template).filter_by(temp_id = id).first()
        if not db_templates:
            return make_response(
                jsonify({"msg": "Template not found"}), HTTP_404_NOT_FOUND
            )
            
        if temp_text.strip() == "" and temp_html.strip() == "":
            return make_response(jsonify({"msg": "html or text not provided"}), HTTP_400_BAD_REQUEST)
        if temp_text and temp_html :
            return make_response(jsonify({"msg": "Invalid both, choose one"}), HTTP_400_BAD_REQUEST)
        if temp_text.strip() == ""and temp_html :
            temp_text = None
        else:
            temp_html = None

        

        db_temp = (
            db.session.query(Template)
            .filter(Template.temp_name == temp_name, Template.temp_id != id)
            .first()
        )
        if db_temp:
            return make_response(
                jsonify({"msg": "Template name already taken"}), HTTP_409_CONFLICT
            )
        current_datetime = datetime.now()

        db_templates.temp_name = temp_name
        db_templates.temp_subject = temp_subject
        db_templates.temp_text = temp_text
        db_templates.temp_html = temp_html
        db_templates.modified_date = current_datetime

        db.session.commit()

        return make_response(jsonify({"msg": "Email Template Updated"}), HTTP_200_OK)

    # @jwt_required()   
    def get(self, id):
        # permission_check = check_admin_permission()
        # if permission_check:
        #     return permission_check
        
        db_templates = db.session.query(Template).filter_by(temp_id=id).first()

        if not db_templates:
            return make_response(
                jsonify({"msg": "Email Template not found"}), HTTP_404_NOT_FOUND
            )
        data = []
        if db_templates.modified_date:
            modifile_date = db_templates.modified_date.strftime('%Y-%m-%d')
        else:
            modifile_date = None
        data.append(
            {
                "id": db_templates.temp_id,
                "name": db_templates.temp_name,
                "subject": db_templates.temp_subject,
                "text": db_templates.temp_text,
                "html": db_templates.temp_html,
                "modified_date": modifile_date,
                }
            )

        return make_response(
            jsonify({"email_template": data}), HTTP_200_OK
        )