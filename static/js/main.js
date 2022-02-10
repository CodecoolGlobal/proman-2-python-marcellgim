import { boardsManager } from "./controller/boardsManager.js";

function init() {
  boardsManager.init();
  boardsManager.loadBoards();
  setInterval(boardsManager.clientChange, 500)
}

init();
