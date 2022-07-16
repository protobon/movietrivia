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


@app.route("/home")
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


@app.route("/scoreboard")
def scoreboard():
    return render_template("scoreboard.html")


@app.route("/logout")
def logout():
    session_id = request.cookies.get('session_id')
    if session_id:
        user = AUTH.get_user_from_session_id(session_id=session_id)
        AUTH.destroy_session(user.id)
    return redirect("/home")


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


@app.route("/api/fetch-question", methods=["POST"], strict_slashes=False)
def get_question():
    """Sends a question object in json format"""
    question_id = request.get_json()["questionId"]
    return jsonify(db.fetch_question(question_id=question_id))


@app.route("/api/calculate-score", methods=["POST"], strict_slashes=False)
def check_answers():
    """Checks all the answers in one game and calculates the total score"""
    results = request.get_json()
    score = db.get_match_score(results)
    return jsonify(score)


@app.route("/api/history/save", methods=["POST"], strict_slashes=False)
def save_match():
    session_id = request.cookies.get("session_id")
    user = AUTH.get_user_from_session_id(session_id)
    if not user:
        return jsonify({"authorized": False}), 401
    score = request.get_json()["score"]
    if db.save_match(uid=user.id, username=user.username, score=score):
        return jsonify({"success": True})
    return jsonify({"success": False})


@app.route("/api/scoreboard", strict_slashes=False)
def api_scoreboard():
    matches = db.scoreboard()
    matches = sorted(matches, key=lambda d: d['score'], reverse=True)
    return jsonify(matches)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
