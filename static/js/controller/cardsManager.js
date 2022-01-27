import { dataHandler } from "../data/dataHandler.js";
import { htmlFactory, htmlTemplates } from "../view/htmlFactory.js";
import { domManager } from "../view/domManager.js";

export let cardsManager = {
  loadCards: async function (boardId) {
    const cards = await dataHandler.getCardsByBoardId(boardId);
    for (let card of cards) {
      //todo: Implement a function that gets all statusIds
      const cardBuilder = htmlFactory(htmlTemplates.card);
      const content = cardBuilder(card);
      domManager.addChild(
          `.board-column-content[data-board-id="${boardId}"][data-status-id="${card['status_id']}"]`,
          content
      );
      initEventListeners(card);
    }
  },
};

function deleteButtonHandler(clickEvent) {
  const cardId = clickEvent.target.dataset.cardId
  dataHandler.deleteCard(cardId)
  clickEvent.target.parentElement.remove()
}


async function renameCardHandler(submitEvent) {
  submitEvent.preventDefault();
  const cardId = submitEvent.target.dataset.cardId;
  const newTitle = submitEvent.target.querySelector("input").value;
  await dataHandler.renameCard(cardId, newTitle);
  const newCard = await dataHandler.getCard(cardId);
  const titleBuilder = htmlFactory(htmlTemplates.cardTitle);
  submitEvent.target.outerHTML = titleBuilder(newCard);
  initEventListeners(newCard);
}


function editCardnameHandler(clickEvent) {
  const nameForm = document.createElement("form");
  nameForm.dataset.cardId = clickEvent.target.dataset.cardId;
  const formBuilder = htmlFactory(htmlTemplates.nameForm);
  nameForm.innerHTML = formBuilder(clickEvent.target.innerText);
  nameForm.addEventListener("submit", renameCardHandler)
  clickEvent.target.replaceWith(nameForm);
}

function initEventListeners(card) {
  const cardIdentifier = `.card[data-card-id="${card.id}"]`;
  domManager.addEventListener(
    `.card-title[data-card-id="${card.id}"]`,
    "click",
    editCardnameHandler
      );
  domManager.addEventListener(
    `.delete-card[data-card-id="${card.id}"]`,
    "click",
    deleteButtonHandler
  );
  domManager.addEventListener(cardIdentifier, "dragstart", handleDragStart);
}


function handleDragStart(dragEvent) {
  const cardIdentifier = `.card[data-card-id="${dragEvent.target.dataset.cardId}"]`
  dragEvent.dataTransfer.setData("text/plain", cardIdentifier);
}