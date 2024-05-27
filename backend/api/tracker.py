from flask import request, jsonify, make_response, send_file, render_template
from flask_restx import  Namespace, Resource
from api.models import Group, Target, Page, Campaign, t_grouptarget, db

import socket

tracker_ns = Namespace("tracker", description="Track email operations")

def get_client_ip():
    if request.headers.get('X-Forwarded-For'):
        ip = request.headers.get('X-Forwarded-For').split(',')[0]
    else:
        ip = request.remote_addr
    return ip


@tracker_ns.route("/track_send")
class Tracker_send(Resource):
    def get(self):
        email = request.args.get('email')
        password = request.args.get('password')
        session = request.args.get('session')
        ip_address = get_client_ip()
        # userid= request.args.get('id')
        
        try:
            host_name = socket.gethostbyaddr(ip_address)[0]
        except (socket.herror, socket.gaierror):
            host_name = "Unknown"

        data = []
        data.append(
             {
            "ip_adress": ip_address,
            "hostname": host_name,
            "session": session,
            "password": password,
            "email": email,
            
        })
        return make_response(jsonify(data), 401)
    
@tracker_ns.route("/track_open")
class Tracker_open(Resource):
    def get(self):
        user_open_id = request.args.get('id')

        return None
    
    
@tracker_ns.route("/track_click")
class Tracker_click(Resource):

    def get(self):
        user_click_id = request.args.get('id')
        return None  


@tracker_ns.route("/open")
class html_file(Resource):
    def get(self):
        target_id = request.args.get('id')
        if not target_id:
            return make_response(jsonify({"error": "Target ID is required"}), 400)

        result = (
            db.session.query(Group.id)
            .join(t_grouptarget, t_grouptarget.c.groupid == Group.id)
            .join(Target, t_grouptarget.c.targetid == Target.id)
            .filter(Target.id == target_id)
            .first()
        )

        if result:
            return result.id                #make_response(jsonify({"page_id": result.page_id}), 200)
        else:
            return make_response(jsonify({"error": "No campaign found for the given target ID"}), 404)