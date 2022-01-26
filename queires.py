import data_manager


def get_card_status(status_id):
    """
    Find the first status matching the given id
    :param status_id:
    :return: str
    """
    status = data_manager.execute_select(
        """
        SELECT * FROM statuses s
        WHERE s.id = %(status_id)s
        ;
        """
        , {"status_id": status_id})

    return status


def get_boards():
    """
    Gather all boards
    :return:
    """
    return data_manager.execute_select(
        """
        SELECT * FROM boards
        ;
        """
    )


def get_cards_for_board(board_id):

    matching_cards = data_manager.execute_select(
        """
        SELECT * FROM cards
        WHERE cards.board_id = %(board_id)s
        ;
        """
        , {"board_id": board_id})

    return matching_cards


def update_card_title(card_id, new_name):
    data_manager.execute_modify(
        """
        UPDATE cards SET title = %(new_name)s
        WHERE id = %(card_id)s
        """
        , {"card_id": card_id, "new_name": new_name})
    
    
def update_board_title(board_id, new_name):
    data_manager.execute_modify(
        """
        UPDATE boards SET title = %(new_name)s
        WHERE id = %(board_id)s
        """
        , {"board_id": board_id, "new_name": new_name})


def get_password_by_username(username):
    return data_manager.execute_select(
        """
        SELECT password FROM users
        WHERE username = %(username)s;
        """
        , {"username": username}, False)


def new_user(username, password):
    data_manager.execute_modify(
        """
        INSERT INTO users (username, password)
        VALUES (%(username)s, %(password)s);
        """
        , {"username": username, "password": password})


def check_existing_user(username):
    users = data_manager.execute_select(
        """
        SELECT username FROM users;
        """
        )
    usernames = [user["username"] for user in users]
    return username in usernames
