document.addEventListener('DOMContentLoaded', async function() {
    await checkAuth()
    loadUsers()
    loadAdminRecipes()
})