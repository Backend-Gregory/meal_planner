async function updateNavbar() {
    const token = localStorage.getItem('access_token')
    const adminLink = document.getElementById('admin-link')
    const authButtons = document.getElementById('auth-buttons')
    const userButtons = document.getElementById('user-buttons')

    if (!token) {
        if (authButtons) authButtons.style.display = 'flex'
        if (userButtons) userButtons.style.display = 'none'
        if (adminLink) adminLink.style.display = 'none'
        return
    }

    try {
        const response = await apiRequest('/auth/me', 'GET')
        if (response.ok) {
            const user = await response.json()
            if (authButtons) authButtons.style.display = 'none'
            if (userButtons) userButtons.style.display = 'flex'
            if (adminLink) {
                adminLink.style.display = user.is_admin ? 'block' : 'none'
            }
        } else {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/login.html'
        }
    } catch (error) {
        console.error('Ошибка обновления шапки:', error)
    }
}

document.addEventListener('DOMContentLoaded', updateNavbar)