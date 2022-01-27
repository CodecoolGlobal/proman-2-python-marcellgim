export let dataHandler = {
  getBoards: async function (userId) {
    if (+userId >= 0) {
      return await apiGet(`/api/users/${userId}/boards`);
    } else {
      return await apiGet("/api/public/boards")
    }
  },
  getBoard: async function (boardId) {
    // the board is retrieved and then the callback function is called with the board
    return await apiGet(`/api/boards/${boardId}`);
  },
  getStatuses: async function () {
    const response = await apiGet('/api/statuses/')
    return response
    // the statuses are retrieved and then the callback function is called with the statuses
  },
  getStatus: async function (statusId) {
    // the status is retrieved and then the callback function is called with the status
  },
  getCardsByBoardId: async function (boardId) {
    const response = await apiGet(`/api/boards/${boardId}/cards/`);
    return response;
  },
  getCard: async function (cardId) {
    // the card is retrieved and then the callback function is called with the card
    return await apiGet(`/api/cards/${cardId}`);
  },
  createNewBoard: async function () {
    await apiPost(`/api/boards/create/board/`, {});
  },
  createNewCard: async function (boardId, cardTitle) {
    // creates new card, saves it and calls the callback function with its data, statusId needed
    const response = await apiPost(`/api/boards/${boardId}/add_card`, {cardTitle, boardId});
    return response
  },
  getStatusesByBoardId: async function (boardId) {
    const response = await apiGet(`/api/${boardId}/statuses/`);
    return response
  },
  renameCard: async function (cardId, newTitle) {
    await apiPut(`/api/cards/${cardId}/change_name`, newTitle);
  },
  renameBoard: async function (boardId, newTitle) {
    await apiPut(`/api/boards/${boardId}/change_name`, newTitle);
  },
  getLatestBoard: async function () {
    const response = await apiGet("/api/board/latest/")
    return response
  },
  deleteCard: async function (cardId) {
    await apiDelete(`/api/cards/${cardId}/delete`);
  },
  getUser: async function () {
    return await apiGet("/api/current_user")
  },
  archiveCard: async function (cardId) {
    await apiPost(`/api/cards/${cardId}/archive`);
  },
  getArchivedCards: async function (boardId) {
    return await apiGet(`/api/board/${boardId}/archived`);
  }
};

async function apiGet(url) {
  let response = await fetch(url, {
    method: "GET",
  });
  if (response.status === 200) {
    return response.json();
  }
}

async function apiPost(url, payload) {
  await fetch(url, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

async function apiDelete(url) {
  await fetch(url, {
    method: "DELETE",
  });
}

async function apiPut(url, payload) {
  await fetch(url, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}
