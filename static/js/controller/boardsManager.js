import { dataHandler } from "../data/dataHandler.js";
import { htmlFactory, htmlTemplates } from "../view/htmlFactory.js";
import { domManager } from "../view/domManager.js";
import { cardsManager } from "./cardsManager.js";

export let boardsManager = {
  loadBoards: async function () {
    const boards = await dataHandler.getBoards();
    for (let board of boards) {
      const statuses = await dataHandler.getStatusesByBoardId(board.id)
      const boardBuilder = htmlFactory(htmlTemplates.board);
      const content = boardBuilder(board, statuses);
      domManager.addChild("#root", content);
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
    }
  },
};

function showHideButtonHandler(clickEvent) {
  const boardId = clickEvent.target.dataset.boardId;
  toggleBoard(boardId)
  if(!clickEvent.target.classList.contains("loaded")){
    clickEvent.target.classList.add("loaded")
    cardsManager.loadCards(boardId);
  }
  if(clickEvent.target.innerHTML === "Show Cards"){
    clickEvent.target.innerHTML = "Hide cards"
  } else {
    clickEvent.target.innerHTML = "Show cards"
  }
}

function renameBoardHandler(submitEvent) {
  submitEvent.preventDefault();
  const boardId = submitEvent.target.dataset.boardId;
  const newTitle = submitEvent.target.querySelector("input").value;
  dataHandler.renameBoard(boardId, newTitle);
}

function editBoardnameHandler(clickEvent) {
  const nameForm = document.createElement("form");
  const formBuilder = htmlFactory(htmlTemplates.nameForm);
  nameForm.dataset.boardId = clickEvent.target.dataset.boardId;
  nameForm.innerHTML = formBuilder(clickEvent.target.innerText);
  nameForm.addEventListener("submit", renameBoardHandler)
  clickEvent.target.replaceWith(nameForm);
}

function toggleBoard(boardId){
  let board = document.querySelector(`.board-columns[data-board-id="${boardId}"]`)
  if(board.style.display === ""){
    board.style.display = "flex"
  }else if(board.style.display === "flex"){
    board.style.display = ""
  }
}