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


def get_statuses_by_table_id(table_id):
    statuses = data_manager.execute_select(
        """
        SELECT status_id, statuses.title
        FROM cards
        JOIN statuses ON cards.status_id = statuses.id
        GROUP BY status_id, statuses.id
        """
    )
    return statuses


def add_new_card(board_id, title):

    data_manager.execute_modify(
        """
        INSERT INTO cards VALUES(DEFAULT, %(board_id)s, DEFAULT, %(title)s, DEFAULT);
        """
        , {"board_id": board_id, "title": title})


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



def get_board(board_id):
    return data_manager.execute_select(
        """
        SELECT * FROM boards
        WHERE id = %(board_id)s;
        """
        , {"board_id": board_id}, False)


def get_card(card_id):
    return data_manager.execute_select(
        """
        SELECT * FROM cards
        WHERE id = %(card_id)s;
        """
        , {"card_id": card_id}, False)
 

def delete_card(card_id):
    data_manager.execute_modify(
        """
        DELETE from cards
        WHERE id = %(card_id)s
        """
        , {"card_id": card_id})
