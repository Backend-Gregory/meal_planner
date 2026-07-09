// ===== КЭШ РЕЦЕПТОВ =====
let recipesCache = []

async function loadRecipesForPlan() {
    try {
        const response = await apiRequest('/recipes/?limit=100', 'GET')
        if (response.ok) {
            recipesCache = await response.json()
        }
    } catch (e) {
        console.error('Ошибка загрузки рецептов:', e)
    }
}