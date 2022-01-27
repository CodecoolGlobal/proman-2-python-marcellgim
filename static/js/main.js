import { boardsManager } from "./controller/boardsManager.js";

function init() {
  boardsManager.createBoard();
  boardsManager.loadBoards();
}

init();
