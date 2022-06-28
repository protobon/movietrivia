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
def get_question():
    """Sends a question object in json format"""
    return jsonify(db.fetch_question())


@app.route("/api/calculate-score", methods=["POST"], strict_slashes=False)
def check_answers():
    """Checks all the answers in one game and calculates the total score"""
    results = request.get_json()
    score = db.get_match_score(results)
    return jsonify(score)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)