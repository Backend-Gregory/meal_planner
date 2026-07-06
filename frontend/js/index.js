function updateNavbar() {
    const token = localStorage.getItem('token')
    const authButtons = document.querySelector('#auth-buttons')
    const userButtons = document.querySelector('#user-buttons')

    if (token) {
        if (authButtons) authButtons.style.display = 'none'
        if (userButtons) userButtons.style.display = 'flex'
    } else {
        if (authButtons) authButtons.style.display = 'flex'
        if (userButtons) userButtons.style.display = 'none'
    }
}

document.addEventListener('DOMContentLoaded', updateNavbar)