async function register() {
    try {
        const name = document.querySelector('#name').value
        const email = document.querySelector('#email').value
        const password = document.querySelector('#password').value
        if (!name) throw new Error('Введите имя')
        if (!email) throw new Error('Введите email')
        if (!password) throw new Error('Введите пароль')
        const response = await apiRequest('/auth/register', 'POST', {
            name: name,
            email: email,
            password: password
        })
        if (response.ok) {
            alert('Регистрация прошла успешно! Пожалуйста, войдите в систему.')
            window.location.href = '/login.html'
        } else {
            const error = await response.json()
            alert('Ошибка: ' + (error.detail || 'Неизвестная ошибка'))
        }
    } catch (error) {
        console.error('Ошибка при регистрации:', error)
        alert('Ошибка при регистрации: ' + error.message)
    }
}

async function login() {
    try {
        const email = document.querySelector('#email').value
        const password = document.querySelector('#password').value
        if (!email) throw new Error('Введите email')
        if (!password) throw new Error('Введите пароль')
        const response = await apiRequest('/auth/login', 'POST', {
            email: email,
            password: password
        })
        if (response.ok) {
            const data = await response.json()
            localStorage.setItem('token', data.access_token)
            alert('Вход в систему прошел успешно!')
            window.location.href = '/recipes.html'
        } else {
            let errorMessage = 'Неизвестная ошибка'
            try {
                const errorData = await response.json()
                errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData)
            } catch {
                errorMessage = 'Ошибка сервера'
            }
            alert('Ошибка: ' + errorMessage)
}
    } catch (error) {
        console.error('Ошибка при входе:', error)
        alert('Ошибка при входе: ' + error.message)
    }
}

async function logout() {
    localStorage.removeItem('token')
    alert('Вы вышли из системы.')
    window.location.href = '/login.html'
}

async function checkAuth() {
    const token = localStorage.getItem('token')
    if (!token) {
        alert('Вы не авторизованы. Пожалуйста, войдите в систему.')
        window.location.href = '/login.html'
    }
}