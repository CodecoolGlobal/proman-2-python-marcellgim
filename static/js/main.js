import { boardsManager } from "./controller/boardsManager.js";

async function init() {
  await boardsManager.init();
  await boardsManager.saveData();
  await boardsManager.loadBoards();
  setInterval(boardsManager.clientChange, 500)
}

init();
