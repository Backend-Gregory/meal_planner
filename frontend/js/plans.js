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

function getRecipeTitle(id) {
    if (!id) return 'Не выбран'
    const recipe = recipesCache.find(r => r.id === id)
    return recipe ? recipe.title : `Рецепт #${id}`
}

// ===== ЗАГРУЗКА ТЕКУЩЕГО ПЛАНА =====
async function loadCurrentPlan() {
    try {
        const response = await apiRequest('/plans/current', 'GET')
        if (response.ok) {
            const plans = await response.json()
            renderPlans(plans)
        } else {
            const error = await response.json()
            alert('Ошибка: ' + (error.detail || 'Неизвестная ошибка'))
        }
    } catch (e) {
        console.error('Ошибка загрузки плана:', e)
        alert('Ошибка загрузки плана')
    }
}
