import {dataHandler} from "../data/dataHandler.js";
import {htmlFactory, htmlTemplates} from "../view/htmlFactory.js";
import {domManager} from "../view/domManager.js";

export let cardsManager = {
    loadCards: async function (boardId) {
        const cards = await dataHandler.getCardsByBoardId(boardId);
        for (let card of cards) {
            const cardBuilder = htmlFactory(htmlTemplates.card);
            const content = cardBuilder(card);
            domManager.addChild(
                `.board-column-content[data-column-id="${card.column_id}"]`,
                content
            );
            this.initEventListeners(card);
        }
    },
    loadArchivedCards: async function (boardId) {
        const cards = await dataHandler.getArchivedCards(boardId);
        for (let card of cards) {
            const cardBuilder = htmlFactory(htmlTemplates.archivedCards);
            const content = cardBuilder(card);
            domManager.addChild(`.archived-cards[data-board-id="${boardId}"]`, content);
            domManager.addEventListener(
                `.archive-card.unarchive[data-card-id="${card["card_id"]}"]`,
                "click",
                unarchiveCardHandler
            );
        }
    },
    initEventListeners: function (card) {
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
        domManager.addEventListener(
            `.archive-card.archive[data-card-id="${card.id}"]`,
            "click",
            archiveCardHandler
        );
    }
};

function deleteButtonHandler(clickEvent) {
    const cardId = clickEvent.target.dataset.cardId
    dataHandler.deleteCard(cardId)
    clickEvent.target.parentElement.remove()
}

function archiveCardHandler(clickEvent) {
    const targetCard = clickEvent.target.closest(".card")
    const archiveButton = targetCard.querySelector(".archive-card")
    archiveButton.removeEventListener("click", archiveCardHandler)
    archiveButton.addEventListener("click", unarchiveCardHandler);
    archiveButton.textContent = "Unarchive"
    targetCard.querySelector(".delete-card").classList.toggle("hide");
    const cardId = targetCard.dataset.cardId
    const boardId = targetCard.closest(".board").dataset.boardId;
    dataHandler.archiveCard(cardId)
    dataHandler.deleteCard(cardId)
    document.querySelector(`.archived-cards[data-board-id="${boardId}"]`).appendChild(targetCard);
}

async function renameCardHandler(submitEvent) {
    submitEvent.preventDefault();
    const cardId = submitEvent.target.dataset.cardId;
    const newTitle = submitEvent.target.querySelector("input").value;
    const newCard = await dataHandler.renameCard(cardId, newTitle);
    const titleBuilder = htmlFactory(htmlTemplates.cardTitle);
    submitEvent.target.outerHTML = titleBuilder(newCard);
    domManager.addEventListener(
        `.card-title[data-card-id="${newCard.id}"]`,
        "click",
        editCardnameHandler
    );
}

function editCardnameHandler(clickEvent) {
    const nameForm = document.createElement("form");
    nameForm.dataset.cardId = clickEvent.target.dataset.cardId;
    const formBuilder = htmlFactory(htmlTemplates.nameForm);
    nameForm.innerHTML = formBuilder(clickEvent.target.innerText);
    nameForm.addEventListener("submit", renameCardHandler)
    clickEvent.target.replaceWith(nameForm);
}

function unarchiveCardHandler(clickEvent) {
    const targetCard = clickEvent.target.closest(".card");
    const archiveButton = targetCard.querySelector(".archive-card");
    archiveButton.removeEventListener("click", unarchiveCardHandler);
    archiveButton.addEventListener("click", archiveCardHandler);
    archiveButton.textContent = "Archive"
    targetCard.querySelector(".delete-card").classList.toggle("hide");
    const cardId = targetCard.dataset.cardId;
    const columnId = targetCard.dataset.columnId;
    dataHandler.unarchiveCard(cardId)
    document.querySelector(`.board-column-content[data-column-id="${columnId}"]`).appendChild(targetCard);
}
