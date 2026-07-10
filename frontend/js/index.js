async function updateNavbar() {
    const authButtons = document.getElementById('auth-buttons')
    const userButtons = document.getElementById('user-buttons')
    const startBtn = document.getElementById('start-btn')
    const loginBtn = document.getElementById('login-btn')
    const adminLink = document.getElementById('admin-link')

    const token = localStorage.getItem('access_token')
    if (!token) {
        showUnauthorized(authButtons, userButtons, startBtn, loginBtn, adminLink)
        return
    }

    try {
        const response = await apiRequest('/auth/me', 'GET')
        if (response.ok) {
            const user = await response.json()
            showAuthorized(authButtons, userButtons, startBtn, loginBtn, adminLink, user.is_admin)
        } else {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            showUnauthorized(authButtons, userButtons, startBtn, loginBtn, adminLink)
        }
    } catch (error) {
        showUnauthorized(authButtons, userButtons, startBtn, loginBtn, adminLink)
    }
}

function showAuthorized(authButtons, userButtons, startBtn, loginBtn, adminLink, isAdmin) {
    if (authButtons) authButtons.style.display = 'none'
    if (userButtons) userButtons.style.display = 'flex'
    if (startBtn) startBtn.style.display = 'none'
    if (loginBtn) loginBtn.style.display = 'none'
    
    if (adminLink) {
        adminLink.style.display = isAdmin ? 'block' : 'none'
    }
}

function showUnauthorized(authButtons, userButtons, startBtn, loginBtn, adminLink) {
    if (authButtons) authButtons.style.display = 'flex'
    if (userButtons) userButtons.style.display = 'none'
    if (startBtn) startBtn.style.display = 'inline-block'
    if (loginBtn) loginBtn.style.display = 'inline-block'
    if (adminLink) adminLink.style.display = 'none'
}

document.addEventListener('DOMContentLoaded', function() {
    updateNavbar()
})

window.addEventListener('storage', function(e) {
    if (e.key === 'access_token' || e.key === 'refresh_token') {
        updateNavbar()
    }
})
