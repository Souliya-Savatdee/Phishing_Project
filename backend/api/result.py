import re
from datetime import datetime
from flask import request, jsonify, make_response, send_file
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import get_jwt, jwt_required


from api.models import db, Group, User, Smtp, Template, Page, Campaign, Result
from constans.http_status_code import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
)

result_campaign_ns = Namespace("result", description="Result_campaign operations")


@result_campaign_ns.route("/")
class ResultCampaign(Resource):
    # @jwt_required()
    def get(self):

        db_result = db.session.query(Result).all()
        # status = db_result.status
        # status_list = [int(num.strip()) for num in status.split("|")]
        data = []
        for result in db_result:
            status = result.status
            status_list = [int(num.strip()) for num in status.split("|")]
            if result.modified_date:
                modifile_date = result.modified_date.strftime("%Y-%m-%d")
            else:
                modifile_date = None
            data.append(
                {
                    "email": result.email,
                    "cam_id": result.cam_id,
                    "status": {
                        "total": status_list[0],
                        "send_mail": status_list[1],
                        "open": status_list[2],
                        "click": status_list[3],
                        "submit": status_list[4],
                        "error": status_list[5],
                    },
                    "modified_date": modifile_date,
                }
            )
        return make_response(jsonify({"result": data}), HTTP_200_OK)


@result_campaign_ns.route("/download/<int:id>")
class DownloanManagment(Resource):
    # @jwt_required()

    def get(self, id):

        db_result = db.session.query(Result).filter_by(rid=id).first()
        if not db_result:
            return make_response(
                jsonify({"msg": "Result not found"}), HTTP_404_NOT_FOUND
            )

        db_campaign = (
            db.session.query(Campaign).filter_by(cam_id=db_result.cam_id).first()
        )
        cam_name = db_campaign.cam_name
        file_path = f"/Users/souliya/Desktop/Project Phishing/backend/result/{cam_name}_result.xlsx"

        return send_file(
            file_path,
            as_attachment=True,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
