import {dataHandler} from "../data/dataHandler.js";
import {addNewCardForm, htmlFactory, htmlTemplates} from "../view/htmlFactory.js";
import {domManager} from "../view/domManager.js";
import {cardsManager} from "./cardsManager.js";

export let boardsManager = {
    init: async function () {
        this.user = await dataHandler.getUser();
    },
    saveData: async function () {
        const data = await dataHandler.getData(boardsManager.user)
        localStorage.setItem('Storage', JSON.stringify(data))
    },
    clientChange: async function(){
        const data = await dataHandler.getData(boardsManager.user)
        const clients_data = localStorage.getItem('Storage');
        if(JSON.stringify(data) !== clients_data) {
            await getAllColumnContent()
        }
    },
    loadBoards: async function () {
        const boards = await dataHandler.getBoards(boardsManager.user);
        this.createBoardButtonListeners(boardsManager.user);
        for (let board of boards) {
            const columns = await dataHandler.getColumnsByBoardId(board.id)
            const boardBuilder = htmlFactory(htmlTemplates.board);
            const content = boardBuilder(board, columns);
            domManager.addChild("#root", content);
            this.eventListeners(board, columns)
            await cardsManager.loadCards(board.id);
            await cardsManager.loadArchivedCards(board.id)
        }
    },
    eventListeners: function (board, statuses) {
        domManager.addEventListener(
            `.toggle-board-button[data-board-id="${board.id}"]`,
            "click",
            showHideButtonHandler
        );
        domManager.addEventListener(
            `.board-title[data-board-id="${board.id}"]`,
            "click",
            editBoardnameHandler
        );
        domManager.addEventListener(
            `.new-card[data-board-id="${board.id}"]`,
            "click",
            addCardEventHandler
        );
        domManager.addEventListener(
            `.show-archived-cards[data-board-id="${board.id}"]`,
            "click",
            getArchivedCardsHandler
        );
        dragula(Array.from(document.querySelectorAll(`.board-column-content[data-board-id="${board.id}"]`)))
            .on("drop", dropCard);
        domManager.addEventListener(
            `.delete-board[data-board-id="${board.id}"]`,
            "click",
            deleteHandler
        );
        for (let column of statuses) {
            domManager.addEventListener(
                `.column-title[data-column-id="${column.id}"]`,
                "click",
                editColumnNameHandler
            );
            domManager.addEventListener(
                `.add-column[data-board-id="${board.id}"]`,
                "click",
                addColumnHandler
            );
            domManager.addEventListener(
            `.delete-column-button[data-column-id="${column.id}"`,
            "click",
            deleteColumnHandler
            );
        }
    },
    createBoardButtonListeners: function (user) {
        domManager.addEventListener(
            '.new-board-public',
            "click",
            createPublicBoard
        );
        if (+user >= 0) {
            domManager.addEventListener(
                '.new-board-private',
                "click",
                createPrivateBoard
            );
        }
    }
};


async function getAllColumnContent(){
    const boards = await dataHandler.getBoards(boardsManager.user);
    for(let board of boards){

        let board_header = document.querySelector(`.board-title[data-board-id="${board.id}"]`);
        board_header.innerText = `${board.title}`
        let board_column = document.querySelector(`.board-columns[data-board-id="${board.id}"]`)
        let columns = await dataHandler.getColumnsByBoardId(board.id)
        let columnBuilder = htmlFactory(htmlTemplates.addColumn)
        let content = columnBuilder(board, columns)

        board_column.innerHTML = content+`<button class="add-column" data-board-id="${board.id}">+</button>`
        await cardsManager.loadCards(board.id)
        boardsManager.eventListeners(board, columns)
    }
    await boardsManager.saveData()
}

async function createPublicBoard() {
    const newBoard = await dataHandler.createPublicBoard();
    const columns = await dataHandler.getColumnsByBoardId(newBoard.id);
    const boardBuilder = htmlFactory(htmlTemplates.board);
    const content = boardBuilder(newBoard, columns);
    domManager.addChild("#root", content);
    boardsManager.eventListeners(newBoard, columns)
    await boardsManager.saveData()
}

async function createPrivateBoard() {
    const newBoard = await dataHandler.createPrivateBoard(boardsManager.user);
    const columns = await dataHandler.getColumnsByBoardId(newBoard.id);
    const boardBuilder = htmlFactory(htmlTemplates.board);
    const content = boardBuilder(newBoard, columns);
    domManager.addChild("#root", content);
    boardsManager.eventListeners(newBoard, columns)
}

function showHideButtonHandler(clickEvent) {
    const boardId = clickEvent.target.dataset.boardId;
    toggleBoard(boardId)
    if (clickEvent.target.innerHTML === "⋁") {
        clickEvent.target.innerHTML = "⋀"
    } else {
        clickEvent.target.innerHTML = "⋁"
    }
}

async function renameBoardHandler(submitEvent) {
    submitEvent.preventDefault();
    const boardId = submitEvent.target.dataset.boardId;
    let newTitle = submitEvent.target.querySelector("input").value;
    if (newTitle === "") {
        newTitle = "Board"
    }
    const newBoard = await dataHandler.renameBoard(boardId, newTitle);
    const titleBuilder = htmlFactory(htmlTemplates.boardTitle);
    submitEvent.target.outerHTML = titleBuilder(newBoard);
    await boardsManager.saveData()
    domManager.addEventListener(
        `.board-title[data-board-id="${newBoard.id}"]`,
        "click",
        editBoardnameHandler
    );
}

function editBoardnameHandler(clickEvent) {
    const nameForm = document.createElement("form");
    const formBuilder = htmlFactory(htmlTemplates.nameForm);
    nameForm.dataset.boardId = clickEvent.target.dataset.boardId;
    nameForm.classList.add("board-title");
    nameForm.innerHTML = formBuilder(clickEvent.target.innerText);
    nameForm.addEventListener("submit", renameBoardHandler)
    clickEvent.target.replaceWith(nameForm);
    boardsManager.saveData()

}

async function createCardEventHandler(submitEvent) {
    submitEvent.preventDefault();
    const boardId = submitEvent.target.dataset.boardId;
    const title = submitEvent.target.querySelector("input").value;
    const newCard = await dataHandler.createNewCard(boardId, title);
    const cardBuilder = htmlFactory(htmlTemplates.card);
    const content = cardBuilder(newCard);
    domManager.addChild(`.board-column-content[data-board-id="${boardId}"]`, content);
    cardsManager.initEventListeners(newCard);
    // Replace with initial button
    const addButton = document.createElement("button");
    addButton.classList.add("new-card");
    addButton.dataset.boardId = boardId;
    addButton.textContent = "Add new card";
    addButton.addEventListener("click", addCardEventHandler);
    submitEvent.target.replaceWith(addButton);
    await boardsManager.saveData()
}


function addCardEventHandler(clickEvent) {
    const cardForm = document.createElement("form");
    cardForm.dataset.boardId = clickEvent.target.dataset.boardId;
    cardForm.innerHTML = addNewCardForm();
    cardForm.addEventListener("submit", createCardEventHandler);
    clickEvent.target.replaceWith(cardForm);
    boardsManager.saveData()
}

function toggleBoard(boardId) {
    let board = document.querySelector(`.board-content[data-board-id="${boardId}"]`)
    board.classList.toggle("hide");
}


async function getArchivedCardsHandler(clickEvent) {
    const boardId = clickEvent.target.dataset.boardId;
    toggleArchivedCards(boardId);
    if (clickEvent.target.innerHTML === "Show Archived Cards") {
        clickEvent.target.innerHTML = "Hide Archived Cards"
    } else {
        clickEvent.target.innerHTML = "Show Archived Cards"
    }
}

function toggleArchivedCards(boardId) {
    const archive = document.querySelector(`.archived-cards[data-board-id="${boardId}"]`)
    archive.classList.toggle("hide");
}

async function dropCard(el, target) {
    await dataHandler.moveCard(el.dataset.cardId, target.dataset.columnId);
    el.dataset.columnId = target.dataset.columnId;
    const cardOrder = [];
    for (let i = 0; i < target.children.length; i++) {
        cardOrder.push(target.children[i].dataset.cardId);
    }
    await dataHandler.reorderCards(cardOrder);
    await boardsManager.saveData()
}

async function deleteHandler(clickEvent) {
    const deleteButton = clickEvent.currentTarget;
    const boardId = deleteButton.dataset.boardId;
    const result = await dataHandler.deleteBoard(boardId);
    if (result === "Board deleted") {
        deleteButton.closest(".board").remove();
    } else {
        alert("Unauthorized");
    }
    await boardsManager.saveData()
}

async function renameColumnHandler(submitEvent) {
    submitEvent.preventDefault();
    const columnId = submitEvent.target.dataset.columnId;
    let newTitle = submitEvent.target.querySelector("input").value;
    if (newTitle === "") {
        newTitle = "New Column"
    }
    await dataHandler.renameColumn(columnId, newTitle);
    const newColumn = await dataHandler.getColumn(columnId);
    const titleBuilder = htmlFactory(htmlTemplates.columnTitle);
    submitEvent.target.outerHTML = titleBuilder(newColumn);
    await boardsManager.saveData()
    domManager.addEventListener(
        `.column-title[data-column-id="${columnId}"]`,
        "click",
        editColumnNameHandler
    )
}

function editColumnNameHandler(clickEvent) {
    const nameForm = document.createElement("form");
    const formBuilder = htmlFactory(htmlTemplates.nameForm);
    nameForm.dataset.columnId = clickEvent.target.dataset.columnId;
    nameForm.classList.add("column-title")
    nameForm.innerHTML = formBuilder(clickEvent.target.innerText);
    nameForm.addEventListener("submit", renameColumnHandler)
    clickEvent.target.replaceWith(nameForm);
}

async function addColumnHandler(clickEvent) {
    const boardId = clickEvent.target.dataset.boardId;
    const new_column = await dataHandler.addColumn(boardId);
    const columnBuilder = htmlFactory(htmlTemplates.addColumn);
    const content = columnBuilder(boardId, new_column)
    const test = `<button class="add-column" data-board-id="${boardId}">+</button>`
    const targetBoard = clickEvent.target.closest('.board').querySelector('.board-columns')
    targetBoard.insertAdjacentHTML("beforeend", content)
    clickEvent.target.remove()
    targetBoard.insertAdjacentHTML("beforeend", test)

    domManager.addEventListener(
        `.column-title[data-column-id="${new_column[0]['id']}"]`,
        "click",
        editColumnNameHandler
    )
    domManager.addEventListener(
        `.add-column[data-board-id="${boardId}"]`,
        "click",
        addColumnHandler
    )
    domManager.addEventListener(
        `.delete-column-button[data-column-id="${new_column[0]['id']}"`,
        "click",
        deleteColumnHandler
    )
    dragula(Array.from(document.querySelectorAll(`.board-column-content[data-board-id="${board.id}"]`)))
        .on("drop", dropCard);
    await boardsManager.saveData()
}

function deleteColumnHandler(clickEvent) {
    const columnId = clickEvent.currentTarget.dataset.columnId
    dataHandler.deleteColumn(columnId)
    clickEvent.currentTarget.parentElement.parentElement.remove()
}