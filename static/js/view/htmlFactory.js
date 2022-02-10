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
            return () => {
                return ""
            }
    }
}

function boardBuilder(board, columns) {
    let columnsContent = columnBuilder(board, columns)
    return `
<section class="board" data-board-id=${board.id}>
    <div class="board-header">
        <div>
            <span class="board-title" data-board-id="${board.id}">${board.title}</span>
        </div>
        <div class="button-container">
            <button class="new-card" data-board-id="${board.id}"> New Card</button>
            <button class="toggle-board-button" data-board-id="${board.id}">&xvee;</button>
            <button class="show-archived-cards" data-board-id="${board.id}">Show Archived Cards</button>
            <button class="delete-board" data-board-id="${board.id}"><i class="fas fa-trash-alt"></i></button>
        </div>
    </div>
    <div class="board-content hide" data-board-id="${board.id}">
        <div class="board-columns" data-board-id="${board.id}">
            ${columnsContent}
            <button class="add-column" data-board-id="${board.id}">+</button>
        </div>
        <div class="archived-cards hide" data-board-id="${board.id}"></div>
    </div>
</section>
`;
}

function cardBuilder(card) {
    return `
    <div class="card" data-card-id="${card.id}" data-column-id="${card['column_id']}">
        <div class="card-title" data-card-id="${card.id}">${card.title}</div>
        <button class="delete-card" data-card-id="${card.id}"><i class="fas fa-trash-alt"></i></button>
        <button class="archive-card archive" data-card-id="${card.id}"><i class="fas fa-archive"></i></button>
    </div>`;

}

export function addNewCardForm() {
    return '<input type="text">' +
        '<button type="submit">Save</button>'

}

function nameFormBuilder(currentValue) {
    return `<input type="text" value="${currentValue}">`
}


function columnBuilder(board, columns) {
    let columnsContent = ``
    for (let i = 0; i < columns.length; i++) {
        columnsContent +=
            `
<div class="board-column" data-board-id=${board.id}>
    <div class="column-title" data-column-id=${columns[i]['id']}>${columns[i]['title']}</div>
    <div class="delete-column-button-container">
    <button class="delete-column-button" data-column-id=${columns[i]['id']}><i class="fas fa-trash-alt"></i></button>
    </div>
    <div class="board-column-content" data-board-id="${board.id}" data-column-id=${columns[i]['id']}></div>
</div>
`
    }
    return columnsContent
}

function boardTitleBuilder(board) {
    return `<span class="board-title" data-board-id="${board.id}">${board.title}</span>`
}

function columnTitleBuilder(column) {
    return `<div class="column-title" data-column-id="${column.id}">${column.title}</div>`
}

function cardTitleBuilder(card) {
    return `<div class="card-title" data-card-id="${card.id}">${card.title}</div>`
}

function archivedCardsBuilder(archivedCard) {
    return `<div class="card" data-card-id="${archivedCard['card_id']}" data-column-id="${archivedCard['column_id']}">
            <div class="card-title" data-card-id="${archivedCard['card_id']}">${archivedCard.title}</div>
            <button class="delete-card hide" data-card-id="${archivedCard['card_id']}"><i class="fas fa-trash-alt"></i></button>
            <button class="archive-card unarchive" data-card-id="${archivedCard['card_id']}">Unarchive</button>
            </div>`
}
