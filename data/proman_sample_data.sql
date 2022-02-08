--
-- PostgreSQL database Proman
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

SET default_tablespace = '';

SET default_with_oids = false;

---
--- drop tables
---

DROP TABLE IF EXISTS statuses CASCADE;
DROP TABLE IF EXISTS boards CASCADE;
DROP TABLE IF EXISTS archived_cards;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS archived_cards;
DROP TABLE IF EXISTS board_columns;

---
--- create tables
---

CREATE TABLE statuses (
    id       SERIAL PRIMARY KEY     NOT NULL,
    title    VARCHAR(200)           NOT NULL
);

CREATE TABLE boards (
    id          SERIAL PRIMARY KEY  NOT NULL,
    title       VARCHAR(200)        NOT NULL,
    user_id     INTEGER
);

CREATE TABLE cards (
    id          SERIAL PRIMARY KEY  NOT NULL,
    board_id    INTEGER             NOT NULL,
    status_id   INTEGER             DEFAULT 1,
    title       VARCHAR (200)       NOT NULL,
    card_order  INTEGER             DEFAULT 1
);

CREATE TABLE users (
    id          SERIAL PRIMARY KEY  NOT NULL,
    username    TEXT                NOT NULL,
    password    TEXT                NOT NULL
);

CREATE TABLE archived_cards
(
    id         SERIAL PRIMARY KEY  NOT NULL,
    card_id    int,
    board_id   int,
    status_id  int,
    title      varchar(200),
    card_order int
);

CREATE TABLE board_columns
(
    board_id  int
        constraint fk_board_columns_board_id
            references boards,
    status_id integer
        constraint fk_board_columns_status_id
            references statuses,
    title     varchar(200),
    id        SERIAL constraint board_columns_pk PRIMARY KEY NOT NULL
);

create unique index board_columns_id_uindex
    on board_columns (id);
---
--- insert data
---

INSERT INTO statuses(title) VALUES ('new');
INSERT INTO statuses(title) VALUES ('in progress');
INSERT INTO statuses(title) VALUES ('testing');
INSERT INTO statuses(title) VALUES ('done');

INSERT INTO boards(title) VALUES ('Board 1');
INSERT INTO boards(title) VALUES ('Board 2');

INSERT INTO cards VALUES (nextval('cards_id_seq'), 1, 1, 'new card 1', 1);
INSERT INTO cards VALUES (nextval('cards_id_seq'), 1, 1, 'new card 2', 2);
INSERT INTO cards VALUES (nextval('cards_id_seq'), 1, 2, 'in progress card', 1);
INSERT INTO cards VALUES (nextval('cards_id_seq'), 1, 3, 'planning', 1);
INSERT INTO cards VALUES (nextval('cards_id_seq'), 1, 4, 'done card 1', 1);
INSERT INTO cards VALUES (nextval('cards_id_seq'), 1, 4, 'done card 1', 2);
INSERT INTO cards VALUES (nextval('cards_id_seq'), 2, 1, 'new card 1', 1);
INSERT INTO cards VALUES (nextval('cards_id_seq'), 2, 1, 'new card 2', 2);
INSERT INTO cards VALUES (nextval('cards_id_seq'), 2, 2, 'in progress card', 1);
INSERT INTO cards VALUES (nextval('cards_id_seq'), 2, 3, 'planning', 1);
INSERT INTO cards VALUES (nextval('cards_id_seq'), 2, 4, 'done card 1', 1);
INSERT INTO cards VALUES (nextval('cards_id_seq'), 2, 4, 'done card 1', 2);

INSERT INTO board_columns VALUES(1, 1);
INSERT INTO board_columns VALUES(1, 2);
INSERT INTO board_columns VALUES(1, 3);
INSERT INTO board_columns VALUES(1, 4);
INSERT INTO board_columns VALUES(2, 1);
INSERT INTO board_columns VALUES(2, 2);
INSERT INTO board_columns VALUES(2, 3);
INSERT INTO board_columns VALUES(2, 4);

---
--- add constraints
---

ALTER TABLE ONLY cards
ADD CONSTRAINT fk_cards_board_id FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE;

ALTER TABLE ONLY cards
    ADD CONSTRAINT fk_cards_status_id FOREIGN KEY (status_id) REFERENCES statuses(id);

ALTER TABLE ONLY boards
    ADD CONSTRAINT  fk_boards_user_id FOREIGN KEY  (user_id) REFERENCES users(id);

ALTER TABLE ONLY board_columns
    ADD CONSTRAINT fk_board_columns_board_id FOREIGN KEY (board_id) REFERENCES boards(id);

ALTER TABLE ONLY board_columns
    ADD CONSTRAINT fk_board_columns_status_id FOREIGN KEY (status_id) REFERENCES statuses(id);
