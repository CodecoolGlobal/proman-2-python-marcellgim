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

async function createPublicBoard(){
  await dataHandler.createPublicBoard()
  const board = await dataHandler.getLatestBoard()
  const statuses = await dataHandler.getStatuses()
  const boardBuilder = htmlFactory(htmlTemplates.board)
  const content = boardBuilder(board, statuses)
  domManager.addChild("#root", content);
  boardsManager.eventListeners(board)
}
async function createPrivateBoard(){
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
  if(clickEvent.target.innerHTML === "Show Cards"){
    clickEvent.target.innerHTML = "Hide Cards"
  } else {
    clickEvent.target.innerHTML = "Show Cards"
  }
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