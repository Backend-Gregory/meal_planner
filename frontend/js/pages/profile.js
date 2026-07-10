document.addEventListener('DOMContentLoaded', async function() {
    await checkAuth()
    loadProfile()

    // Обновление имени
    document.getElementById('updateNameForm').addEventListener('submit', async function(e) {
        e.preventDefault()
        const newName = document.getElementById('newName').value.trim()
        if (!newName) {
            showToast('Введите новое имя', 'warning')
            return
        }
        await updateName(newName)
        this.reset()
    })

    // Обновление email
    document.getElementById('updateEmailForm').addEventListener('submit', async function(e) {
        e.preventDefault()
        const newEmail = document.getElementById('newEmail').value.trim()
        if (!newEmail) {
            showToast('Введите новый email', 'warning')
            return
        }
        await updateEmail(newEmail)
        this.reset()
    })

    // Смена пароля
    document.getElementById('changePasswordForm').addEventListener('submit', async function(e) {
        e.preventDefault()
        const oldPassword = document.getElementById('oldPassword').value
        const newPassword = document.getElementById('newPassword').value
        const confirmPassword = document.getElementById('confirmPassword').value

        if (newPassword !== confirmPassword) {
            showToast('Пароли не совпадают', 'warning')
            return
        }
        if (newPassword.length < 8) {
            showToast('Пароль должен быть не менее 8 символов', 'warning')
            return
        }

        await changePassword(oldPassword, newPassword)
        this.reset()
    })
})