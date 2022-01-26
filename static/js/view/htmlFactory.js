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

function boardBuilder(board) {
    return `<div class="board-container">
                <div class="board" data-board-id=${board.id}>${board.title}</div>
                <button class="toggle-board-button" data-board-id="${board.id}">Show Cards</button>
                <button class="new-card" data-board-id="${board.id}">Add new card</button>
            </div>`;
}

function cardBuilder(card) {
    return `
    <div class="card" data-card-id="${card.id}">${card.title}
        <button class="delete-card" data-card-id="${card.id}">Delete</button>
        <div class="card-title" data-card-id="${card.id}"></div>
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

