async function loadRecipes() {
    try {
        const response = await apiRequest('/recipes', 'GET')
        if (response.ok) {
            const recipes = await response.json()
            renderRecipes(recipes)
        } else {
            const error = await response.json()
            alert('Ошибка: ' + (error.detail || 'Неизвестная ошибка'))
        }
    } catch (error) {
        console.error('Ошибка загрузки рецептов:', error)
    }
}