import { dataHandler } from "../data/dataHandler.js";
import {addNewCardForm, htmlFactory, htmlTemplates} from "../view/htmlFactory.js";
import { domManager } from "../view/domManager.js";
import { cardsManager } from "./cardsManager.js";

export let boardsManager = {
  loadBoards: async function () {
    const user = await dataHandler.getUser();
    const boards = await dataHandler.getBoards(user);
    for (let board of boards) {
      const statuses = await dataHandler.getStatusesByBoardId(board.id)
      const boardBuilder = htmlFactory(htmlTemplates.board);
      const content = boardBuilder(board, statuses);
      domManager.addChild("#root", content);
      this.eventListeners(board)
    }
  },
  eventListeners: function (board){
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
          `.board-columns[data-board-id="${board.id}"]`,
          "drop",
          dropCardHandler
      );
      domManager.addEventListener(
          `.board-columns[data-board-id="${board.id}"]`,
          "dragover",
          dragoverHandler
      );
  },
  createPublicBoardButton: function () {
    domManager.addEventListener(
        '.new-board-public',
        "click",
        createPublicBoard
    )
  },
  createPrivateBoardButton: function () {
    domManager.addEventListener(
        '.new-board-private',
        "click",
        createPrivateBoard
    )
  }
};

async function createPublicBoard() {
  await dataHandler.createPublicBoard()
  const board = await dataHandler.getLatestBoard()
  const statuses = await dataHandler.getStatuses()
  const boardBuilder = htmlFactory(htmlTemplates.board)
  const content = boardBuilder(board, statuses)
  domManager.addChild("#root", content);
  boardsManager.eventListeners(board)
}

async function createPrivateBoard() {
  const userId = await dataHandler.getUser()
  await dataHandler.createPrivateBoard(userId)
  const board = await dataHandler.getLatestBoard()
  const statuses = await dataHandler.getStatuses()
  const boardBuilder = htmlFactory(htmlTemplates.board)
  const content = boardBuilder(board, statuses)
  domManager.addChild("#root", content);
  boardsManager.eventListeners(board)
}

function showHideButtonHandler(clickEvent) {
  const boardId = clickEvent.target.dataset.boardId;
  toggleBoard(boardId)
  if(!clickEvent.target.classList.contains("loaded")){
    clickEvent.target.classList.add("loaded")
    cardsManager.loadCards(boardId);
  }
  if(clickEvent.target.innerHTML === "⋁"){
    clickEvent.target.innerHTML = "⋀"
  } else {
    clickEvent.target.innerHTML = "⋁"
  }
  console.log(clickEvent.target.innerHTML)
}

async function renameBoardHandler(submitEvent) {
  submitEvent.preventDefault();
  const boardId = submitEvent.target.dataset.boardId;
  let newTitle = submitEvent.target.querySelector("input").value;
  if(newTitle === ""){
    newTitle = "Board"
  }
  await dataHandler.renameBoard(boardId, newTitle);
  const newBoard = await dataHandler.getBoard(boardId);
  const titleBuilder = htmlFactory(htmlTemplates.boardTitle);
  submitEvent.target.outerHTML = titleBuilder(newBoard);
  boardsManager.eventListeners(newBoard)
}

function editBoardnameHandler(clickEvent) {
  const nameForm = document.createElement("form");
  const formBuilder = htmlFactory(htmlTemplates.nameForm);
  nameForm.dataset.boardId = clickEvent.target.dataset.boardId;
  nameForm.innerHTML = formBuilder(clickEvent.target.innerText);
  nameForm.addEventListener("submit", renameBoardHandler)
  clickEvent.target.replaceWith(nameForm);
}

function createCardEventHandler(submitEvent){
  submitEvent.preventDefault();
  const boardId = submitEvent.target.dataset.boardId;
  const title = submitEvent.target.querySelector("input").value;
  dataHandler.createNewCard(boardId, title);
}


function addCardEventHandler(clickEvent) {
    const cardForm = document.createElement("form");
    cardForm.dataset.boardId = clickEvent.target.dataset.boardId;
    cardForm.innerHTML = addNewCardForm()
    cardForm.addEventListener("submit", createCardEventHandler);
    clickEvent.target.replaceWith(cardForm)

}

function toggleBoard(boardId){
  let board = document.querySelector(`.board-columns[data-board-id="${boardId}"]`)
  if(board.style.display === ""){
    board.style.display = "flex"
  }else if(board.style.display === "flex"){
    board.style.display = ""
  }
}

async function dropCardHandler(dropEvent) {
  dropEvent.preventDefault()
  const targetColumn = dropEvent.target.closest(".board-column");
  const identifier = dropEvent.dataTransfer.getData("text/plain");
  const draggedCard = document.querySelector(identifier);
  if (targetColumn !== null && draggedCard.dataset.boardId === targetColumn.dataset.boardId) {
    const targetContentBox = targetColumn.querySelector(".board-column-content");
    const cardId = draggedCard.dataset.cardId;
    const newStatus = targetContentBox.dataset.statusId;
    await dataHandler.moveCard(cardId, newStatus);
    targetContentBox.appendChild(draggedCard);
  }
}

function dragoverHandler (dragEvent) {
    dragEvent.preventDefault();
    dragEvent.dataTransfer.dropEffect = "move";
}