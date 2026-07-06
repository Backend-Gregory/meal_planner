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

function renderRecipes(recipes) {
    const recipesContainer = document.querySelector('#recipes-container')

    if (!recipesContainer) return

    if (recipes.length === 0) {
        recipesContainer.innerHTML = '<p class="text-white text-center">Нет рецептов. Создайте первый!</p>'
        return
    }

    const html = recipes.map(recipe => `
        <div class="col-md-4 mb-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${recipe.title}</h5>
                    <p class="card-text">${recipe.description}</p>
                    <p>Категория: ${recipe.category} | Время: ${recipe.cooking_time} мин</p>
                    <p>Автор: ${recipe.user_name}</p>
                    <button class="btn btn-primary btn-sm">Редактировать</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteRecipe(${recipe.id})">Удалить</button>
                </div>
            </div>
        </div>
    `).join('')
    recipesContainer.innerHTML = html
}