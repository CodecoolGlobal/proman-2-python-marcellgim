export let dataHandler = {
    getBoards: async function (userId) {
        if (+userId >= 0) {
            return await apiGet(`/api/users/${userId}/boards`);
        } else {
            return await apiGet("/api/public/boards")
        }
    },
    getCardsByBoardId: async function (boardId) {
        return await apiGet(`/api/boards/${boardId}/cards`);
    },
    createPublicBoard: async function () {
        return await apiPost(`/api/boards/create`, {});
    },
    createPrivateBoard: async function (userId) {
        return await apiPost(`/api/users/${userId}/boards/create`, {userId})
    },
    createNewCard: async function (boardId, cardTitle) {
        // creates new card, saves it and calls the callback function with its data, statusId needed
        return await apiPost(`/api/boards/${boardId}/add_card`, cardTitle)
    },
    getColumnsByBoardId: async function (boardId) {
        return await apiGet(`/api/boards/${boardId}/columns`)
    },
    renameCard: async function (cardId, newTitle) {
        return await apiPut(`/api/cards/${cardId}/change_name`, newTitle);
    },
    renameBoard: async function (boardId, newTitle) {
        return await apiPut(`/api/boards/${boardId}/change_name`, newTitle);
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
        return await apiGet(`/api/boards/${boardId}/archived_cards`);
    },
    unarchiveCard: async function (cardId) {
        await apiPost(`/api/cards/${cardId}/unarchive`);
    },
    moveCard: async function (cardId, newColumn) {
        await apiPut(`/api/cards/${cardId}/move`, newColumn)
    },
    reorderCards: async function (cardOrder) {
        await apiPut('/api/cards/reorder', cardOrder);
    },
    deleteBoard: async function (boardId) {
        return await apiDelete(`/api/boards/${boardId}/delete`)
    },
    getColumn: async function (columnId) {
        return await apiGet(`/api/columns/${columnId}`);
    },
    renameColumn: async function (columnId, newTitle) {
        await apiPut(`/api/boards/${columnId}/change_title`, newTitle)
    },
    addColumn: async function (boardId) {
        return await apiPost(`/api/boards/${boardId}/new_column`, {})
    },
    deleteColumn: async function (column_id) {
        return await apiDelete(`/api/boards/columns/${column_id}/delete`)
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
    let response = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    if (response.status === 200) {
        return response.json();
    }
}

async function apiDelete(url) {
    let response = await fetch(url, {
        method: "DELETE",
    });
    if (response.status === 200) {
        return response.json();
    }
}

async function apiPut(url, payload) {
    let response = await fetch(url, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    if (response.status === 200) {
        return response.json();
    }
}
