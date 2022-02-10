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
ALTER TABLE IF EXISTS ONLY public.cards
    DROP CONSTRAINT IF EXISTS fk_cards_column_id CASCADE;

ALTER TABLE IF EXISTS ONLY public.board_columns
    DROP CONSTRAINT IF EXISTS fk_columns_board_id CASCADE;

ALTER TABLE IF EXISTS ONLY public.boards
    DROP CONSTRAINT IF EXISTS fk_boards_user_id CASCADE;


DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS board_columns CASCADE;
DROP TABLE IF EXISTS boards CASCADE;
DROP TABLE IF EXISTS archived_cards;
DROP TABLE IF EXISTS users CASCADE;

---
--- create tables
---


CREATE TABLE boards
(
    id      SERIAL PRIMARY KEY NOT NULL,
    title   VARCHAR(200)       NOT NULL,
    user_id INTEGER
);

CREATE TABLE cards
(
    id         SERIAL PRIMARY KEY NOT NULL,
    column_id  INTEGER            NOT NULL,
    title      VARCHAR(200)       NOT NULL,
    card_order INTEGER DEFAULT 1
);

CREATE TABLE users
(
    id       SERIAL PRIMARY KEY NOT NULL,
    username TEXT               NOT NULL,
    password TEXT               NOT NULL
);

CREATE TABLE archived_cards
(
    id         SERIAL PRIMARY KEY NOT NULL,
    card_id    int,
    column_id  int,
    title      varchar(200),
    card_order int
);

CREATE TABLE board_columns
(
    id       SERIAL PRIMARY KEY NOT NULL,
    board_id int,
    title    varchar(200)
);


CREATE TABLE changelog
(
    id          SERIAL PRIMARY KEY NOT NULL,
    board_id    INTEGER NOT NULL,
    operation   VARCHAR(20),
    user_id     INTEGER
);
---
--- insert data
---

INSERT INTO boards(title)
    VALUES ('Board 1');
INSERT INTO boards(title)
    VALUES ('Board 2');

INSERT INTO cards
    VALUES (nextval('cards_id_seq'), 1, 'new card 1', 1);
INSERT INTO cards
    VALUES (nextval('cards_id_seq'), 1, 'new card 2', 2);
INSERT INTO cards
    VALUES (nextval('cards_id_seq'), 2, 'in progress card', 1);
INSERT INTO cards
    VALUES (nextval('cards_id_seq'), 3, 'planning', 1);
INSERT INTO cards
    VALUES (nextval('cards_id_seq'), 4, 'done card 1', 1);
INSERT INTO cards
    VALUES (nextval('cards_id_seq'), 4, 'done card 1', 2);
INSERT INTO cards
    VALUES (nextval('cards_id_seq'), 5, 'new card 1', 1);
INSERT INTO cards
    VALUES (nextval('cards_id_seq'), 5, 'new card 2', 2);
INSERT INTO cards
    VALUES (nextval('cards_id_seq'), 6, 'in progress card', 1);
INSERT INTO cards
    VALUES (nextval('cards_id_seq'), 7, 'planning', 1);
INSERT INTO cards
    VALUES (nextval('cards_id_seq'), 8, 'done card 1', 1);
INSERT INTO cards
    VALUES (nextval('cards_id_seq'), 8, 'done card 1', 2);

INSERT INTO board_columns
    VALUES (DEFAULT, 1, 'new');
INSERT INTO board_columns
    VALUES (DEFAULT, 1, 'in progress');
INSERT INTO board_columns
    VALUES (DEFAULT, 1, 'testing');
INSERT INTO board_columns
    VALUES (DEFAULT, 1, 'done');
INSERT INTO board_columns
    VALUES (DEFAULT, 2, 'new');
INSERT INTO board_columns
    VALUES (DEFAULT, 2, 'in progress');
INSERT INTO board_columns
    VALUES (DEFAULT, 2, 'testing');
INSERT INTO board_columns
    VALUES (DEFAULT, 2, 'done');

---
--- add constraints
---

ALTER TABLE ONLY board_columns
    ADD CONSTRAINT fk_columns_board_id FOREIGN KEY (board_id) REFERENCES boards (id) ON DELETE CASCADE;

ALTER TABLE ONLY cards
    ADD CONSTRAINT fk_cards_column_id FOREIGN KEY (column_id) REFERENCES board_columns (id) ON DELETE CASCADE;

ALTER TABLE ONLY boards
    ADD CONSTRAINT fk_boards_user_id FOREIGN KEY (user_id) REFERENCES users (id);

