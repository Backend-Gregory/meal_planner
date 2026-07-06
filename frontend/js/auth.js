const name = document.querySelector('#name').value
const email = document.querySelector('#email').value
const password = document.querySelector('#password').value

async function register() {
    try {
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