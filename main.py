from flask import Flask, render_template, url_for, request, redirect, session, flash, abort
from dotenv import load_dotenv

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
    if not queires.check_existing_user(username):
        queires.new_user(username, password)
        return redirect(url_for("index"))
    else:
        flash("Username already exists")
        return redirect(url_for("register"))


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
        else:
            flash("Wrong username and/or password")
            return redirect(url_for("login"))


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


@app.route("/api/boards/create/public/", methods=["POST"])
@json_response
def create_new_board():
    default_board_title = "Board Title"
    board = queires.create_new_board(default_board_title)
    queires.create_default_columns_for_board(board['id'])
    return board


@app.route("/api/boards/create/private/<int:user_id>", methods=["POST"])
@json_response
def create_private_board(user_id):
    default_board_title = "Private Board"
    return queires.create_private_board(default_board_title, user_id)


@app.route("/api/boards/<int:board_id>/add_card", methods=["POST"])
@json_response
def add_new_card(board_id):
    title = request.get_json()
    return queires.add_new_card(board_id, title)


@app.route("/api/cards/<int:card_id>/change_name", methods=["PUT"])
@json_response
def rename_card(card_id: int):
    name = request.get_json()
    queires.update_card_title(card_id, name)
    return "Card title changed"


@app.route("/api/boards/<int:board_id>/change_name", methods=["PUT"])
@json_response
def rename_board(board_id: int):
    name = request.get_json()
    queires.update_board_title(board_id, name)
    return "Board title changed"


@app.route("/api/cards/<int:card_id>/delete", methods=["DELETE"])
@json_response
def delete_card(card_id):
    queires.delete_card(card_id)
    return "Card deleted"


@app.route("/api/cards/<int:card_id>/archive", methods=["POST"])
@json_response
def archive_card(card_id):
    queires.save_archived_cards(card_id)
    return "Card archived"


@app.route("/api/board/<int:board_id>/archived", methods=["GET"])
@json_response
def list_archived_cards(board_id):
    archived_cards = queires.get_archived_cards(board_id)
    return archived_cards


@app.route("/api/card/<int:card_id>/unarchive", methods=["POST"])
@json_response
def unarchive_card(card_id):
    queires.unarchive_card(card_id)
    return "Card unarchived"


@app.route("/api/statuses/")
@json_response
def statuses():
    return queires.get_statuses()


@app.route("/api/<int:board_id>/statuses/")
@json_response
def board_statuses(board_id: int):
    return queires.get_statuses_by_table_id(board_id)


@app.route("/api/board/latest/")
@json_response
def get_latest_board():
    return queires.get_latest_board()


@app.route("/api/boards/<int:board_id>")
@json_response
def get_board(board_id):
    return queires.get_board(board_id)


@app.route("/api/cards/<int:card_id>")
@json_response
def get_card(card_id):
    return queires.get_card(card_id)


@app.route("/api/current_user")
@json_response
def get_user_id():
    if "username" in session:
        return queires.get_user_id(session["username"])["id"]
    else:
        return -1


@app.route("/api/users/<int:user_id>/boards")
@app.route("/api/public/boards")
@json_response
def get_user_boards(user_id=None):
    if user_id is None:
        return queires.get_public_boards()
    else:
        return queires.get_user_boards(user_id)


@app.route("/api/cards/<int:card_id>/move", methods=["PUT"])
@json_response
def move_card(card_id):
    new_status = request.get_json()
    queires.change_card_status(card_id, new_status)
    return "Card moved"


@app.route('/api/boards/<int:board_id>/delete', methods=['DELETE'])
@json_response
def delete_board(board_id):
    user_id = None
    if "username" in session:
        user_id = queires.get_user_id(session["username"])["id"]
    owner = queires.get_owner(board_id)
    if owner is not None and (user_id != owner):
        abort(403)
    queires.delete_board(board_id, user_id)
    return "Board deleted"


@app.route("/api/columns/<int:column_id>")
@json_response
def get_column(column_id):
    return queires.get_column(column_id)


@app.route("/api/board/<int:column_id>/change_title", methods=["PUT"])
@json_response
def rename_column(column_id: int):
    title = request.get_json()
    queires.update_card_title(column_id, title)
    return "Card title changed"


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
