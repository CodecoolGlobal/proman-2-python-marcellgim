import {dataHandler} from "../data/dataHandler.js";

export const htmlTemplates = {
    board: 1,
    card: 2,
    nameForm: 3,
    boardTitle: 4,
    cardTitle: 5,
    archivedCards: 6,
    columnTitle: 7,
    addColumn: 8
}

export function htmlFactory(template) {
    switch (template) {
        case htmlTemplates.board:
            return boardBuilder
        case htmlTemplates.card:
            return cardBuilder
        case htmlTemplates.nameForm:
            return nameFormBuilder
        case htmlTemplates.boardTitle:
            return boardTitleBuilder
        case htmlTemplates.cardTitle:
            return cardTitleBuilder
        case htmlTemplates.archivedCards:
            return archivedCardsBuilder
        case htmlTemplates.columnTitle:
            return columnTitleBuilder
        case htmlTemplates.addColumn:
            return columnBuilder
        default:
            console.error("Undefined template: " + template)
            return () => { return "" }
    }
}

function boardBuilder(board, board_columns) {
    console.log(board_columns)
    let columns = columnBuilder(board.id, board_columns)
    return `
<section class="board" data-board-id=${board.id}>
    <div class="board-header">
        <div>
            <span class="board-title" data-board-id="${board.id}">${board.title}</span>
        </div>
        <div class="button-container">
            <button class="new-card" data-board-id="${board.id}"> New Card</button>
            <button class="toggle-board-button" data-board-id="${board.id}">&xvee;</button>
            <button class="archived-cards" data-board-id="${board.id}">Show Archived Cards</button>
            <button class="delete-board" data-board-id="${board.id}"><i class="fas fa-trash-alt"></i></button>
        </div>
    </div>
    <div class="board-columns" data-board-id="${board.id}">
        ${columns}
        <button class="add-column" data-board-id="${board.id}">+</button>
    </div>
</section>
`;
}

function cardBuilder(card) {
    return `
    <div class="card" data-card-id="${card.id}" data-board-id="${card['board_id']}" draggable="true">
        <div class="card-title" data-card-id="${card.id}">${card.title}</div>
        <button class="delete-card" data-card-id="${card.id}"><i class="fas fa-trash-alt"></i></button>
        <button class="archive-card" data-card-id="${card.id}">Archive</button>
    </div>`;

}

export function addNewCardForm() {
    return'<input type="text">' +
          '<button type="submit">Save</button>'

}

function nameFormBuilder(currentValue) {
    return `<input type="text" value="${currentValue}">
            <button type="submit">Save</button>`
}


function columnBuilder(boardId, board_statuses){

    let columns = ``
    for(let i = 0; i < board_statuses.length; i++){
        columns +=
`
<div class="board-column" data-board-id=${boardId}>
    <div class="column-title" data-column-id="${board_statuses[i]['id']}">${board_statuses[i]['title']}</div>
    <div class="board-column-content" data-board-id="${boardId}" data-status-id=${board_statuses[i]['status_id']}></div>
</div>
`
    }
    return columns
}

function boardTitleBuilder(board) {
    return `<span class="board-title" data-board-id="${board.id}" >${board.title}</span>`
}

function columnTitleBuilder(column) {
    return `<div class="column-title" data-column-id="${column.id}">${column.title}</div>`
}

function cardTitleBuilder(card) {
    return `<div class="card-title" data-card-id="${card.id}">${card.title}</div>`
}

function archivedCardsBuilder(archivedCards){
    return `<div class="archived-cards" data-card-id="${archivedCards['card_id']}">${archivedCards['title']}
            <button class="unarchive-card" data-card-id="${archivedCards['card_id']}">Unarchive card</button>
            </div>`
}
