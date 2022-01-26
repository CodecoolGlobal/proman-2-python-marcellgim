from flask import Flask, render_template, url_for, request, redirect, session
from dotenv import load_dotenv
from http import HTTPStatus

from util import json_response, hash_password, check_password
import mimetypes
import queires

mimetypes.add_type('application/javascript', '.js')
app = Flask(__name__)
app.secret_key = "so_secret"
load_dotenv()


@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template('index.html')


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "GET":
        return render_template('register.html')
    username = request.form.get("username")
    password = hash_password(request.form.get("password"))
    queires.new_user(username, password)
    return redirect(url_for("index"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template('login.html')
    else:
        username = request.form.get("username")
        plain_pw = request.form.get("password")
        if check_password(plain_pw, username):
            session["username"] = username
        return redirect(url_for("index"))


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))


@app.route("/api/boards")
@json_response
def get_boards():
    """
    All the boards
    """
    return queires.get_boards()


@app.route("/api/boards/<int:board_id>/cards/")
@json_response
def get_cards_for_board(board_id: int):
    """
    All cards that belongs to a board
    :param board_id: id of the parent board
    """
    return queires.get_cards_for_board(board_id)


@app.route("/api/boards/<int:card_id>/change_name", methods=["PUT"])
def rename_card(card_id: int):
    name = request.get_json()
    queires.update_card_title(card_id, name)
    return "Card title changed", HTTPStatus.OK


@app.route("/api/boards/<int:board_id>/change_name", methods=["PUT"])
def rename_board(board_id: int):
    name = request.get_json()
    queires.update_board_title(board_id, name)
    return "Board title changed", HTTPStatus.OK


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
