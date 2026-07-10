// ===== ЗАГРУЗКА ПРОФИЛЯ =====
async function loadProfile() {
    try {
        const response = await apiRequest('/auth/me', 'GET')
        if (response.ok) {
            const user = await response.json()
            document.getElementById('profile-name').textContent = user.name
            document.getElementById('profile-email').textContent = user.email
            document.getElementById('profile-created').textContent = new Date(user.created_at).toLocaleDateString('ru-RU')
        } else {
            const error = await response.json()
            showToast('Ошибка: ' + (error.detail || 'Неизвестная ошибка'), 'error')
        }
    } catch (e) {
        console.error('Ошибка загрузки профиля:', e)
        showToast('Ошибка загрузки профиля', 'error')
    }
}

// ===== ОБНОВЛЕНИЕ ИМЕНИ =====
async function updateName(newName) {
    try {
        const response = await apiRequest('/auth/update', 'PUT', {
            name: newName
        })
        if (response.ok) {
            showToast('Имя обновлено!', 'success')
            loadProfile()
        } else {
            const error = await response.json()
            showToast('Ошибка: ' + (error.detail || 'Неизвестная ошибка'), 'error')
        }
    } catch (e) {
        console.error('Ошибка обновления имени:', e)
        showToast('Ошибка обновления имени', 'error')
    }
}
