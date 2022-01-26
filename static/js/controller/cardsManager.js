import { dataHandler } from "../data/dataHandler.js";
import { htmlFactory, htmlTemplates } from "../view/htmlFactory.js";
import { domManager } from "../view/domManager.js";

export let cardsManager = {
  loadCards: async function (boardId) {
    const cards = await dataHandler.getCardsByBoardId(boardId);
    for (let card of cards) {
      //todo: Implement a function that gets all statusIds
      console.log(card)
      const cardBuilder = htmlFactory(htmlTemplates.card);
      const content = cardBuilder(card);
      domManager.addChild(`.board-column-content[data-board-id="${boardId}"].board-column-content[status-id="${card['status_id']}"]`, content);

      domManager.addEventListener(
        `.card[data-card-id="${card.id}"]`,
        "click",
        deleteButtonHandler
      );
      domManager.addEventListener(
          `.card-title[data-card-id="${card.id}"]`,
          "click",
          editCardnameHandler
      );
    }
  },
};

function deleteButtonHandler(clickEvent) {
}


async function renameCardHandler(submitEvent) {
  submitEvent.preventDefault();
  const cardId = submitEvent.target.dataset.cardId;
  const newTitle = submitEvent.target.querySelector("input").value;
  await dataHandler.renameCard(cardId, newTitle);
  const newCard = await dataHandler.getCard(cardId);
  const titleBuilder = htmlFactory(htmlTemplates.cardTitle);
  submitEvent.target.outerHTML = titleBuilder(newCard);
}

function editCardnameHandler(clickEvent) {
  const nameForm = document.createElement("form");
  nameForm.dataset.cardId = clickEvent.target.dataset.cardId;
  const formBuilder = htmlFactory(htmlTemplates.nameForm);
  nameForm.innerHTML = formBuilder(clickEvent.target.innerText);
  nameForm.addEventListener("submit", renameCardHandler)
  clickEvent.target.replaceWith(nameForm);
}
