function updateNavbar() {
    const token = localStorage.getItem('token')
    const authButtons = document.getElementById('auth-buttons')
    const userButtons = document.getElementById('user-buttons')
    const startBtn = document.getElementById('start-btn')      // кнопка "Начать"
    const loginBtn = document.getElementById('login-btn')      // кнопка "Войти" в теле

    if (token) {
        if (authButtons) authButtons.style.display = 'none'
        if (userButtons) userButtons.style.display = 'flex'
        if (startBtn) startBtn.style.display = 'none'
        if (loginBtn) loginBtn.style.display = 'none'
    } else {
        if (authButtons) authButtons.style.display = 'flex'
        if (userButtons) userButtons.style.display = 'none'
        if (startBtn) startBtn.style.display = 'inline-block'
        if (loginBtn) loginBtn.style.display = 'inline-block'
    }
}
