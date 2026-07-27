// ===== ЗАГРУЗКА СПИСКА ПОКУПОК =====
async function loadShoppingList() {
    try {
        const response = await apiRequest('/shopping/', 'GET')
        if (response.ok) {
            const items = await response.json()
            renderShoppingList(items)
        } else {
            const errorData = await response.json()
            const errorMessage = getErrorMessage(errorData)
            showToast('Ошибка: ' + errorMessage, 'error')
        }
    } catch (error) {
        const errorMessage = error.message || JSON.stringify(error)
        showToast('Ошибка: ' + errorMessage, 'error')
    }
}

// ===== ОТРИСОВКА СПИСКА =====
function renderShoppingList(items) {
    const container = document.getElementById('shopping-container')
    if (!container) return

    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon"><i class="fas fa-shopping-cart"></i></span>
                <h5>Список покупок пуст</h5>
                <p>Создайте план на неделю, и продукты автоматически появятся здесь</p>
                <a href="plans.html" class="btn btn-accent"><i class="fas fa-calendar-alt"></i> Перейти к планам</a>
            </div>
        `
        return
    }

    const purchased = items.filter(item => item.purchased)
    const notPurchased = items.filter(item => !item.purchased)

    let html = `
        <div class="glass-card p-4 mb-4">
            <h4 class="mb-3"><i class="fas fa-check-circle" style="color:#22c55e;"></i> Куплено (${purchased.length})</h4>
            ${purchased.length === 0 ? '<p class="text-muted">Ничего не куплено</p>' : ''}
            ${purchased.map(item => `
                <div class="d-flex justify-content-between align-items-center p-2 bg-success bg-opacity-10 rounded mb-2">
                    <span><s>${item.ingredient}</s> <small class="text-muted">${item.quantity}</small></span>
                    <button class="btn btn-sm btn-outline-light" onclick="togglePurchased(${item.id}, true)"><i class="fas fa-undo"></i></button>
                </div>
            `).join('')}
        </div>

        <div class="glass-card p-4">
            <h4 class="mb-3"><i class="fas fa-shopping-bag" style="color:#e94560;"></i> Не куплено (${notPurchased.length})</h4>
            ${notPurchased.length === 0 ? '<p class="text-muted">Всё куплено! 🎉</p>' : ''}
            ${notPurchased.map(item => `
                <div class="d-flex justify-content-between align-items-center p-2 bg-dark bg-opacity-25 rounded mb-2">
                    <span>${item.ingredient} <small class="text-muted">${item.quantity}</small></span>
                    <button class="btn btn-sm btn-accent" onclick="togglePurchased(${item.id}, false)">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
            `).join('')}
        </div>
    `

    container.innerHTML = html
}

// ===== ПЕРЕКЛЮЧЕНИЕ СТАТУСА =====
async function togglePurchased(id, currentStatus) {
    try {
        const response = await apiRequest(`/shopping/${id}`, 'PATCH', {
            purchased: !currentStatus
        })
        if (response.ok) {
            showToast('Статус обновлён!', 'success')
            loadShoppingList()
        } else {
            const errorData = await response.json()
            const errorMessage = getErrorMessage(errorData)
            showToast('Ошибка: ' + errorMessage, 'error')
        }
    } catch (error) {
        const errorMessage = error.message || JSON.stringify(error)
        showToast('Ошибка: ' + errorMessage, 'error')
    }
}

async function clearShoppingList() {
    if (!confirm('Вы уверены, что хотите удалить все покупки за эту неделю?')) return
    try {
        const response = await apiRequest('/shopping/clear', 'DELETE')
        if (response.ok) {
            showToast('Список покупок очищен! 🧹', 'success')
            loadShoppingList()
        } else {
            const errorData = await response.json()
            const errorMessage = getErrorMessage(errorData)
            showToast('Ошибка: ' + errorMessage, 'error')
        }
    } catch (error) {
        const errorMessage = error.message || JSON.stringify(error)
        showToast('Ошибка: ' + errorMessage, 'error')
    }
}