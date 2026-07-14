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
            const errorData = await response.json()
            const errorMessage = getErrorMessage(errorData)
            showToast('Ошибка: ' + errorMessage, 'error')
        }
    } catch (error) {
        const errorMessage = error.message || JSON.stringify(error)
        showToast('Ошибка: ' + errorMessage, 'error')
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
            const errorData = await response.json()
            const errorMessage = getErrorMessage(errorData)
            showToast('Ошибка: ' + errorMessage, 'error')
        }
    } catch (error) {
        const errorMessage = error.message || JSON.stringify(error)
        showToast('Ошибка: ' + errorMessage, 'error')
    }
}
// ===== ОБНОВЛЕНИЕ EMAIL =====
async function updateEmail(newEmail) {
    try {
        const response = await apiRequest('/auth/update', 'PUT', {
            email: newEmail
        })
        if (response.ok) {
            showToast('Email обновлён!', 'success')
            loadProfile()
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

// ===== СМЕНА ПАРОЛЯ =====
async function changePassword(oldPassword, newPassword) {
    try {
        const response = await apiRequest('/auth/change-password', 'PUT', {
            old_password: oldPassword,
            new_password: newPassword
        })
        if (response.ok) {
            showToast('Пароль изменён!', 'success')
            document.getElementById('oldPassword').value = ''
            document.getElementById('newPassword').value = ''
            document.getElementById('confirmPassword').value = ''
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