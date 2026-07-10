// ===== ЗАГРУЗКА ПОЛЬЗОВАТЕЛЕЙ =====
async function loadUsers() {
    try {
        const response = await apiRequest('/admin/users', 'GET')
        if (response.ok) {
            const users = await response.json()
            renderUsers(users)
        } else {
            const error = await response.json()
            showToast('Ошибка: ' + (error.detail || 'Неизвестная ошибка'), 'error')
        }
    } catch (e) {
        console.error('Ошибка загрузки пользователей:', e)
        showToast('Ошибка загрузки пользователей', 'error')
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
            const error = await response.json()
            showToast('Ошибка: ' + (error.detail || 'Неизвестная ошибка'), 'error')
        }
    } catch (e) {
        console.error('Ошибка блокировки:', e)
        showToast('Ошибка блокировки', 'error')
    }
}
