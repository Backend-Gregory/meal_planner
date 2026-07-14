// ===== ЗАГРУЗКА ПОЛЬЗОВАТЕЛЕЙ =====
async function loadUsers() {
    try {
        const response = await apiRequest('/admin/users', 'GET')
        if (response.ok) {
            const users = await response.json()
            renderUsers(users)
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

function renderUsers(users) {
    const container = document.getElementById('admin-users')
    if (!container) return

    if (!users || users.length === 0) {
        container.innerHTML = '<p class="text-muted">Нет пользователей</p>'
        return
    }

    let html = `
        <table class="table table-dark table-hover">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Имя</th>
                    <th>Email</th>
                    <th>Статус</th>
                    <th>Действие</th>
                </tr>
            </thead>
            <tbody>
    `

    users.forEach(user => {
        const status = user.is_active ? '🟢 Активен' : '🔴 Заблокирован'
        const action = user.is_active
            ? `<button class="btn btn-sm btn-danger" onclick="blockUser(${user.id})">🔒 Блок</button>`
            : `<button class="btn btn-sm btn-success" onclick="unblockUser(${user.id})">🔓 Разблок</button>`
        html += `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${status}</td>
                <td>${action}</td>
            </tr>
        `
    })

    html += `</tbody></table>`
    container.innerHTML = html
}

// ===== БЛОКИРОВКА =====
async function blockUser(id) {
    if (!confirm('Заблокировать пользователя?')) return
    try {
        const response = await apiRequest(`/admin/users/${id}/block`, 'PATCH')
        if (response.ok) {
            showToast('Пользователь заблокирован!', 'success')
            loadUsers()
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

// ===== РАЗБЛОКИРОВКА =====
async function unblockUser(id) {
    if (!confirm('Разблокировать пользователя?')) return
    try {
        const response = await apiRequest(`/admin/users/${id}/unblock`, 'PATCH')
        if (response.ok) {
            showToast('Пользователь разблокирован!', 'success')
            loadUsers()
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

// ===== ЗАГРУЗКА РЕЦЕПТОВ =====
async function loadAdminRecipes() {
    try {
        const response = await apiRequest('/admin/recipes', 'GET')
        if (response.ok) {
            const recipes = await response.json()
            renderAdminRecipes(recipes)
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

function renderAdminRecipes(recipes) {
    const container = document.getElementById('admin-recipes')
    if (!container) return

    if (!recipes || recipes.length === 0) {
        container.innerHTML = '<p class="text-muted">Нет рецептов</p>'
        return
    }

    let html = `
        <table class="table table-dark table-hover">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Название</th>
                    <th>Автор</th>
                    <th>Категория</th>
                    <th>Действие</th>
                </tr>
            </thead>
            <tbody>
    `

    recipes.forEach(recipe => {
        html += `
            <tr>
                <td>${recipe.id}</td>
                <td>${recipe.title}</td>
                <td>${recipe.user_name || 'Неизвестен'}</td>
                <td>${recipe.category}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteAdminRecipe(${recipe.id})">🗑️ Удалить</button>
                </td>
            </tr>
        `
    })

    html += `</tbody></table>`
    container.innerHTML = html
}

// ===== УДАЛЕНИЕ РЕЦЕПТА (АДМИН) =====
async function deleteAdminRecipe(id) {
    if (!confirm('Удалить этот рецепт?')) return
    try {
        const response = await apiRequest(`/admin/recipes/${id}`, 'DELETE')
        if (response.ok) {
            showToast('Рецепт удалён!', 'success')
            loadAdminRecipes()
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