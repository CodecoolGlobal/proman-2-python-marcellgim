import {dataHandler} from "../data/dataHandler.js";

export const htmlTemplates = {
    board: 1,
    card: 2,
    nameForm: 3,
    boardTitle: 4,
    cardTitle: 5
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
        default:
            console.error("Undefined template: " + template)
            return () => { return "" }
    }
}

function boardBuilder(board, statuses) {
    // console.log(board)
    // console.log(statuses)
    let columns = columnBuilder(board, statuses)
    return `
<section class="board" data-board-id=${board.id}>
    <div class="board-header"><span class="board-title" data-board-id="${board.id}">${board.title}</span><button class="toggle-board-button" data-board-id="${board.id}">Show Cards</button><button class="new-card" data-board-id="${board.id}">Add new card</button></div>
    <div class="board-columns" data-board-id="${board.id}">
        ${columns}
    </div>
</section>
`;
}

function cardBuilder(card) {
    return `
<div class="card" data-card-id="${card.id}">
    <div class="card-remove"></div>
    <div class="card-title" data-card-id="${card.id}">${card.title}</div>
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


function columnBuilder(board, statuses){
    let columns = ``
    for(let i = 0; i < statuses.length; i++){
        columns +=
`
<div class="board-column" data-board-id=${board.id}>
    <div class="board-column title">${statuses[i]['title']}</div>
    <div class="board-column-content" data-board-id="${board.id}" status-id=${statuses[i]['status_id']}></div>
</div>
`
    }
    return columns
}

function boardTitleBuilder(board) {
    return `<span class="board-title" data-board-id="${board.id}">${board.title}</span>`
}

function cardTitleBuilder(card) {
    return `<div class="card-title" data-card-id="${card.id}">${card.title}</div>`
}