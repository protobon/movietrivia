#!/usr/bin/env python3
""" Flask Application """

from models.auth import Auth
from models.db import DB
from flask import Flask, jsonify, request, abort, redirect, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
AUTH = Auth()
db = DB()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/play")
def play():
    session_id = request.cookies.get('session_id')
    if session_id:
        user = AUTH.get_user_from_session_id(session_id=session_id)
        if user:
            return render_template("play.html")
    return redirect("/auth")


@app.route("/auth")
def auth():
    return render_template("auth.html")


@app.route("/api/auth", methods=["POST"], strict_slashes=False)
def user_auth():
    """Users endpoint"""
    username = request.form["username"]
    password = request.form["password"]
    try:
        AUTH.register_user(username, password)
        session_id = AUTH.create_session(username)
        res = jsonify({"username": username, "message": "logged in"})
        res.set_cookie("session_id", session_id)
        print('USER REGISTERED')
        return res
    except ValueError:
        if AUTH.valid_login(username, password):
            print('VALID CREDENTIALS')
            session_id = AUTH.create_session(username)
            res = jsonify({"username": username, "message": "logged in"})
            res.set_cookie("session_id", session_id)
            print(res)
            return res
        return jsonify({"error": "wrong credentials"}), 401


@app.route("/api/fetch-question", methods=["GET"], strict_slashes=False)
def match_data():
    """Get questions for new match"""
    return jsonify(db.fetch_question())


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

# @app.route("/api/sessions/new", methods=["POST"], strict_slashes=False)
# def login():
#     """Creates a new session for user"""
#     username = request.form["username"]
#     password = request.form["password"]
#
#     if not AUTH.valid_login(username, password):
#         abort(401)
#
#     session_id = AUTH.create_session(username)
#     res = jsonify({"username": username, "message": "logged in"})
#     res.set_cookie("session_id", session_id)
#     return res


# @app.route("/api/sessions/delete", methods=["DELETE"], strict_slashes=False)
# def logout():
#     """Destroys a user's session"""
#     session_id = request.cookies.get("session_id")
#     user = AUTH.get_user_from_session_id(session_id)
#
#     if user:
#         AUTH.destroy_session(user.id)
#         return redirect("/")
#
#     abort(403)


# @app.route("/api/profile", methods=["GET"], strict_slashes=False)
# def profile():
#     """Finds user from session id"""
#     session_id = request.cookies.get("session_id")
#     user = AUTH.get_user_from_session_id(session_id)
#     if user:
#         return jsonify({"username": user.username}), 200
#
#     abort(403)


# @app.route("/api/reset_password", methods=["POST"], strict_slashes=False)
# def get_reset_password_token():
#     """returns a reset token to user from username"""
#     username = request.form["username"]
#     try:
#         reset_token = AUTH.get_reset_password_token(username)
#         return jsonify({"username": username, "reset_token": reset_token})
#     except ValueError:
#         abort(403)


# @app.route("/api/reset_password", methods=["PUT"], strict_slashes=False)
# def update_password():
#     """updates a user password"""
#     username = request.form["username"]
#     reset_token = request.form["reset_token"]
#     new_password = request.form["new_password"]
#
#     try:
#         AUTH.update_password(reset_token, new_password)
#         return jsonify({"username": username, "message": "Password updated"}), 200
#     except ValueError:
#         abort(403)
