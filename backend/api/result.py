from datetime import datetime
from flask import request, jsonify, make_response, send_file
from flask_restx import Resource, fields, Namespace
from flask_jwt_extended import get_jwt, jwt_required


from api.models import db, Group, User, Smtp, Template, Page, Campaign, Result
from utils.file_path_excel import file_path_excel, read_excel_to_json
from constans.http_status_code import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
)

result_campaign_ns = Namespace("result", description="Result_campaign operations")


@result_campaign_ns.route("/<int:id>")
class ResultCampaign(Resource):
    # @jwt_required()
    def get(self, id):

        # verify_jwt_in_request()
        # claims = get_jwt()
        # current_user_id = claims['user_id']
        # current_user_role = claims['role']

        db_campaign = db.session.query(Campaign).filter(Campaign.cam_id == id).first()
        if db_campaign is None:
            return make_response(
                jsonify({"msg": "Campaign not found"}), HTTP_404_NOT_FOUND
            )

        # if current_user_role != 'admin' and db_campaign.user_id != current_user_id:
        #     return make_response(jsonify({"msg": "Unauthorized"}), HTTP_403_FORBIDDEN)

        target = db_campaign.group.target
        data = []
        for target in db_campaign.group.target:
            data.append(
                {
                    "id": target.id,
                    "email": target.email,
                    "firstname": target.firstname,
                    "lastname": target.lastname,
                    "status": target.status,
                }
            )
        cam_name = db_campaign.cam_name
        file_path = file_path_excel(cam_name)
        json_data = read_excel_to_json(file_path)

        db_result = db.session.query(Result).filter_by(cam_id=id).first()
        status = db_result.status
        status_list = [int(num.strip()) for num in status.split("|")]

        cam_Data = []
        cam_Data.append(
            {
                "cam_name": db_campaign.cam_name,
                "status": {
                    "total": status_list[0],
                    "send_mail": status_list[1],
                    "open": status_list[2],
                    "click": status_list[3],
                    "submit": status_list[4],
                    "error": status_list[5],
                },
            }
        )

        return make_response(
            jsonify({"result": data, "targetData": json_data, "camData": cam_Data}),
            HTTP_200_OK,
        )


@result_campaign_ns.route("/download/<int:id>")
class DownloanManagment(Resource):
    # @jwt_required()

    def get(self, id):

        db_campaign = db.session.query(Campaign).filter_by(cam_id=id).first()
        if not db_campaign:
            return make_response(
                jsonify({"msg": "Campaign not found"}), HTTP_404_NOT_FOUND
            )

        cam_name = db_campaign.cam_name
        file_path = file_path_excel(cam_name)

        return send_file(
            file_path,
            as_attachment=True,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
