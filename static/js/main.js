import { boardsManager } from "./controller/boardsManager.js";

function init() {
  boardsManager.createPrivateBoardButton()
  boardsManager.createPublicBoardButton();
  boardsManager.loadBoards();
}

init();
