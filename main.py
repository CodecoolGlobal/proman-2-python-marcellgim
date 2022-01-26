from flask import Flask, render_template, url_for, request
from dotenv import load_dotenv


from util import json_response
import mimetypes
import queires
from http import HTTPStatus

mimetypes.add_type('application/javascript', '.js')
app = Flask(__name__)
load_dotenv()


@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template('index.html')


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


@app.route("/api/boards/<int:board_id>/add_card", methods=["POST"])
def add_new_card(board_id):
    title = request.json['cardTitle']
    queires.add_new_card(board_id, title)
    return "Card added", HTTPStatus.OK


@app.route("/api/cards/<int:card_id>/change_name", methods=["PUT"])
def rename_card(card_id:int):
    name = request.get_json()
    queires.update_card_title(card_id, name)
    return "Card title changed", HTTPStatus.OK


@app.route("/api/boards/<int:board_id>/change_name", methods=["PUT"])
def rename_board(board_id:int):
    name = request.get_json()
    queires.update_board_title(board_id, name)
    return "Board title changed", HTTPStatus.OK


@app.route("/api/statuses/")
@json_response
def statuses():
    return queires.get_statuses()


@app.route("/api/<int:boardId>/statuses/")
@json_response
def board_statuses(boardId: int):
    return queires.get_statuses_by_table_id(boardId)


@app.route("/api/boards/<int:board_id>")
@json_response
def get_board(board_id):
    return queires.get_board(board_id)


@app.route("/api/cards/<int:card_id>")
@json_response
def get_card(card_id):
    return queires.get_card(card_id)


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
