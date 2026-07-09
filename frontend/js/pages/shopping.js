document.addEventListener('DOMContentLoaded', async function() {
    await checkAuth()
    loadShoppingList()
})

const clearBtn = document.getElementById('clearShoppingBtn')
if (clearBtn) {
    clearBtn.addEventListener('click', clearShoppingList)
}