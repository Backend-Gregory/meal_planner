async function updateNavbar() {
    const token = localStorage.getItem('access_token')
    const authButtons = document.getElementById('auth-buttons')
    const userButtons = document.getElementById('user-buttons')
    const startBtn = document.getElementById('start-btn')
    const loginBtn = document.getElementById('login-btn')

    if (!token) {
        showUnauthorized(authButtons, userButtons, startBtn, loginBtn)
        return
    }

    // Проверяем токен через сервер
    try {
        const response = await apiRequest('/auth/me', 'GET')
        if (response.ok) {
            showAuthorized(authButtons, userButtons, startBtn, loginBtn)
        } else {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            showUnauthorized(authButtons, userButtons, startBtn, loginBtn)
        }
    } catch (error) {
        showUnauthorized(authButtons, userButtons, startBtn, loginBtn)
    }
}

function showAuthorized(authButtons, userButtons, startBtn, loginBtn) {
    if (authButtons) authButtons.style.display = 'none'
    if (userButtons) userButtons.style.display = 'flex'
    if (startBtn) startBtn.style.display = 'none'
    if (loginBtn) loginBtn.style.display = 'none'
}

function showUnauthorized(authButtons, userButtons, startBtn, loginBtn) {
    if (authButtons) authButtons.style.display = 'flex'
    if (userButtons) userButtons.style.display = 'none'
    if (startBtn) startBtn.style.display = 'inline-block'
    if (loginBtn) loginBtn.style.display = 'inline-block'
}

document.addEventListener('DOMContentLoaded', function() {
    updateNavbar()
})
