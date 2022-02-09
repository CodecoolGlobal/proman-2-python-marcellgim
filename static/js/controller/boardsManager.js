import {dataHandler} from "../data/dataHandler.js";
import {addNewCardForm, htmlFactory, htmlTemplates} from "../view/htmlFactory.js";
import {domManager} from "../view/domManager.js";
import {cardsManager} from "./cardsManager.js";

export let boardsManager = {
    loadBoards: async function () {
        const user = await dataHandler.getUser();
        const boards = await dataHandler.getBoards(user);
        this.createBoardButtonListeners(user);
        for (let board of boards) {
            const columns = await dataHandler.getColumnsByBoardId(board.id)
            const boardBuilder = htmlFactory(htmlTemplates.board);
            const content = boardBuilder(board, columns);
            domManager.addChild("#root", content);
            this.eventListeners(board, columns)
            await cardsManager.loadCards(board.id);
        }
    },
    reloadBoard: async function (boardId, operation) {
        if (operation === "Delete") {
            document.querySelector(`.board[data-board-id="${boardId}"]`).remove();
        } else {

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
            `.archived-cards[data-board-id="${board.id}"]`,
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
            )
            domManager.addEventListener(
                `.add-column[data-board-id="${board.id}"]`,
                "click",
                addColumnHandler
            )
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

async function createPublicBoard() {
    const newBoard = await dataHandler.createPublicBoard();
    const columns = await dataHandler.getColumnsByBoardId(newBoard.id);
    const boardBuilder = htmlFactory(htmlTemplates.board);
    const content = boardBuilder(newBoard, columns);
    domManager.addChild("#root", content);
    boardsManager.eventListeners(newBoard, columns)
}

async function createPrivateBoard() {
    const userId = await dataHandler.getUser();
    const newBoard = await dataHandler.createPrivateBoard(userId);
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
}


function addCardEventHandler(clickEvent) {
    const cardForm = document.createElement("form");
    cardForm.dataset.boardId = clickEvent.target.dataset.boardId;
    cardForm.innerHTML = addNewCardForm();
    cardForm.addEventListener("submit", createCardEventHandler);
    clickEvent.target.replaceWith(cardForm);

}

function toggleBoard(boardId) {
    let board = document.querySelector(`.board-columns[data-board-id="${boardId}"]`)
    if (board.style.display === "") {
        board.style.display = "flex"
    } else if (board.style.display === "flex") {
        board.style.display = ""
    }
}


async function getArchivedCardsHandler(clickEvent) {
    const boardId = clickEvent.target.dataset.boardId;
    toggleArchivedCards();
    if (!clickEvent.target.classList.contains("loaded")) {
        clickEvent.target.classList.add("loaded")
        await cardsManager.loadArchivedCards(boardId);
    }
    if (clickEvent.target.innerHTML === "Show Archived Cards") {
        clickEvent.target.innerHTML = "Hide Archived Cards"
    } else {
        clickEvent.target.innerHTML = "Show Archived Cards"
    }
}

function toggleArchivedCards() {
    let archive = document.getElementsByClassName("archived-cards")
    for (let i = 0; i < archive.length; i++) {
        if (archive[i].style.display == "none") {
            archive[i].style.display = "flex"
        } else if (archive[i].style.display === "flex") {
            archive[i].style.display = "none"
        }
    }
}

async function dropCard(el, target) {
    await dataHandler.moveCard(el.dataset.cardId, target.dataset.columnId);
    const cardOrder = [];
    for (let i = 0; i < target.children.length; i++) {
        cardOrder.push(target.children[i].dataset.cardId);
    }
    await dataHandler.reorderCards(cardOrder);
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
    console.log(columnId)
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
}