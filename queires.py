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


def get_statuses():
    status = data_manager.execute_select(
        """
        SELECT * FROM statuses
        """
    )
    return status


def get_public_boards():
    """
    Gather all public boards
    :return:
    """

    return data_manager.execute_select(
        """
        SELECT * FROM boards
        WHERE user_id IS null;
        ;
        """
    )


def get_user_boards(user_id):
    """
    Gather all public boards and private boards for user
    :return:
    """

    return data_manager.execute_select(
        """
        SELECT * FROM boards
        WHERE user_id IS null OR user_id = %(user_id)s
        ;
        """
        , {"user_id": user_id})


def get_cards_for_board(board_id):

    matching_cards = data_manager.execute_select(
        """
        SELECT
            cards.id,
            cards.title,
            cards.column_id
        FROM cards
        JOIN board_columns
            ON cards.column_id=board_columns.id
        WHERE board_columns.board_id = %(board_id)s
        ORDER BY card_order;
        """
        , {"board_id": board_id})

    return matching_cards


def get_columns_by_board_id(board_id):
    statuses = data_manager.execute_select(
        """
        SELECT id, title
        FROM board_columns
        WHERE board_id = %(board_id)s
        ORDER BY id
        """
        , {"board_id": board_id})
    return statuses


def add_new_column_to_board(board_id, column_title):
    return data_manager.execute_select(
        """
        INSERT INTO board_columns 
        VALUES(DEFAULT, %(board_id)s , %(column_title)s)
        RETURNING *;
        """, {"board_id": board_id, "column_title": column_title})


def add_new_card(column_id, title):
    return data_manager.execute_select(
        """
        INSERT INTO cards (column_id, title)
        VALUES(%(column_id)s, %(title)s)
        RETURNING *;
        """
        , {"column_id": column_id, "title": title}, False)


def update_card_title(card_id, new_name):
    return data_manager.execute_select(
        """
        UPDATE cards SET title = %(new_name)s
        WHERE id = %(card_id)s
        RETURNING *;
        """
        , {"card_id": card_id, "new_name": new_name}, False)


def update_board_title(board_id, new_name):
    return data_manager.execute_select(
        """
        UPDATE boards SET title = %(new_name)s
        WHERE id = %(board_id)s
        RETURNING *;
        """
        , {"board_id": board_id, "new_name": new_name}, False)


def create_new_board(board_title):
    return data_manager.execute_select(
        """
        INSERT INTO boards (title)
        VALUES (%(board_title)s)
        RETURNING *;
        """
        , {"board_title": board_title}, False)


def create_default_columns_for_board(board_id):
    data_manager.execute_modify(
        """
        INSERT INTO board_columns VALUES(DEFAULT, %(board_id)s, 'new'),
                                         (DEFAULT, %(board_id)s, 'in progress'),
                                         (DEFAULT, %(board_id)s, 'testing'),
                                         (DEFAULT, %(board_id)s, 'done');
        """
        , {"board_id": board_id}
    )


def create_private_board(board_title, user_id):
    return data_manager.execute_select(
        """
        INSERT INTO boards (title, user_id)
        VALUES(%(board_title)s, %(user_id)s)
        RETURNING *;
        """
        , {"board_title": board_title, "user_id": user_id}, False)


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


def delete_card(card_id):
    data_manager.execute_modify(
        """
        DELETE from cards
        WHERE id = %(card_id)s
        """
        , {"card_id": card_id})


def get_user_id(username):
    return data_manager.execute_select(
        """
        SELECT id FROM users
        WHERE username = %(username)s
        ;
        """
        , {"username": username}, False)


def save_archived_cards(card_id):
    data_manager.execute_modify(
        """
        INSERT INTO archived_cards (card_id, column_id, title, card_order)
        SELECT id, column_id, title, card_order
        FROM cards
        WHERE id = %(card_id)s;
        """
        , {"card_id": card_id})


def get_archived_cards(board_id):
    return data_manager.execute_select(
        """
        SELECT card_id, column_id, archived_cards.title, card_order
        FROM archived_cards
        JOIN board_columns
            ON archived_cards.column_id=board_columns.id
        WHERE board_columns.board_id = %(board_id)s;
        """
        , {"board_id": board_id})


def unarchive_card(card_id):
    data_manager.execute_modify(
        """
        INSERT INTO cards (id, column_id, title, card_order)
        SELECT card_id, column_id, title, card_order
        FROM archived_cards
        WHERE card_id = %(card_id)s;
        DELETE FROM archived_cards
        WHERE card_id = %(card_id)s;
        """
        , {"card_id": card_id})


def change_card_column(card_id, new_column):
    data_manager.execute_modify(
        """
        UPDATE cards SET
            column_id = %(new_column)s
        WHERE id = %(card_id)s
        ;
        """
        , {"card_id": card_id, "new_column": new_column})


def set_card_order(card_id, card_order):
    data_manager.execute_modify(
        """
        UPDATE cards SET
            card_order = %(card_order)s
        WHERE id = %(card_id)s
        """
        , {"card_order": card_order, "card_id": card_id})

    
def delete_board(board_id, user_id):
    data_manager.execute_modify(
        """
        DELETE FROM boards
        WHERE id = %(board_id)s
        AND (user_id = %(user_id)s OR user_id IS NULL);
        """
        , {"board_id": board_id, "user_id": user_id})


def get_owner(board_id):
    return data_manager.execute_select(
        """
        SELECT users.id FROM users
        JOIN boards ON boards.user_id=users.id
        WHERE boards.id = %(board_id)s;
        """
        , {"board_id": board_id}, False)


def get_first_column_of_board(board_id):
    return data_manager.execute_select(
        """
        SELECT id
        FROM board_columns
        WHERE board_id = %(board_id)s
        ORDER BY id;
        """
        , {"board_id": board_id}, False)


def update_column_title(column_id, title):
    return data_manager.execute_modify(
        """
        UPDATE board_columns
        SET title=%(title)s
        WHERE id=%(column_id)s;
    
    """, {"title": title, "column_id": column_id}
       )


def get_column(column_id):
    return data_manager.execute_select(
        """
        SELECT * FROM board_columns
        WHERE id = %(column_id)s;
        """
        , {"column_id": column_id}, False)
