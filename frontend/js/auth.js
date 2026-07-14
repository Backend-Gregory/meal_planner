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
            showToast('Регистрация прошла успешно! Пожалуйста, войдите в систему.', 'success')
            setTimeout(() => {
                window.location.href = 'recipes.html'
            }, 800)
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

async function login() {
    try {
        const email = document.querySelector('#email').value
        const password = document.querySelector('#password').value
        if (!email) throw new Error('Введите email')
        if (!password) throw new Error('Введите пароль')

        const response = await apiRequest('/auth/login', 'POST', { email, password })

        if (response.ok) {
            const data = await response.json()
            localStorage.setItem('access_token', data.access_token)
            localStorage.setItem('refresh_token', data.refresh_token)
            showToast('Вход выполнен!', 'success')
            setTimeout(() => {
                window.location.href = 'recipes.html'
            }, 800)
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

async function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/login.html'
}

async function checkAuth() {
    const token = localStorage.getItem('access_token')
    if (!token) {
        window.location.href = '/login.html'
        return
    }

    try {
        const response = await apiRequest('/auth/me', 'GET')
        if (!response.ok) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/login.html'
        }
    } catch (error) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login.html'
    }
}