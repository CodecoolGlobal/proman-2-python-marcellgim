import {dataHandler} from "../data/dataHandler.js";

export const htmlTemplates = {
    board: 1,
    card: 2,
    nameForm: 3
}

export function htmlFactory(template) {
    switch (template) {
        case htmlTemplates.board:
            return boardBuilder
        case htmlTemplates.card:
            return cardBuilder
        case htmlTemplates.nameForm:
            return nameFormBuilder
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
    <div class="board-header"><span class="board-title" data-board-id="${board.id}">${board.title}</span><button class="toggle-board-button" data-board-id="${board.id}">Show Cards</button></div>
    <div class="board-columns">
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