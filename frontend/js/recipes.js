// ===== ЗАГРУЗКА СПИСКА =====
async function loadRecipes(search = '', category = '', skip = 0, limit = 10) {
    try {
        const params = new URLSearchParams()
        if (search) params.append('search', search)
        if (category) params.append('category', category)
        params.append('skip', skip)
        params.append('limit', limit)

        const response = await apiRequest(`/recipes/?${params.toString()}`, 'GET')
        if (response.ok) {
            const recipes = await response.json()
            renderRecipes(recipes)
        } else {
            const errorData = await response.json()
            const errorMessage = getErrorMessage(errorData)
            showToast('Ошибка: ' + errorMessage, 'error')
        }
    } catch (error) {
        const errorMessage = error.message || JSON.stringify(error)
        showToast('Ошибка: ' + errorMessage, 'error')
    }
}

// ===== ОТРИСОВКА КАРТОЧЕК =====
function renderRecipes(recipes) {
    const container = document.getElementById('recipes-container')
    if (!container) return

    if (!recipes.length) {
        container.innerHTML = '<p class="text-white text-center">Нет рецептов. Создайте первый!</p>'
        return
    }

    container.innerHTML = recipes.map(recipe => `
        <div class="col-md-4 mb-4 fade-in">
            <div class="card h-100 card-hover">
                <div class="card-body">
                    <h5 class="card-title">${recipe.title}</h5>
                        <p class="card-text">${recipe.description || ''}</p>
                        <p><small>Категория: ${recipe.category}</small></p>
                        <p><small>⏱ ${recipe.cooking_time} мин</small></p>
                        <p><small>👤 ${recipe.user_name || 'Неизвестен'}</small></p>
                        <a href="recipe-detail.html?id=${recipe.id}" class="btn btn-info btn-sm btn-hover">📖 Подробнее</a>
                        <a href="edit-recipe.html?id=${recipe.id}" class="btn btn-primary btn-sm btn-hover">✏️ Редактировать</a>
                        <button onclick="deleteRecipe(${recipe.id})" class="btn btn-danger btn-sm btn-hover">🗑️ Удалить</button>
                </div>
            </div>
        </div>
    `).join('')
}

// ===== СОЗДАНИЕ =====
async function createRecipe() {
    try {
        const title = document.getElementById('recipe_title').value
        const description = document.getElementById('recipe_description').value
        const ingredientsText = document.getElementById('recipe_ingredients').value
        const instructions = document.getElementById('recipe_instructions').value
        const category = document.getElementById('recipe_category').value
        const cooking_time = parseInt(document.getElementById('recipe_cooking_time').value)

        if (!title) return showToast('Введите название', 'warning')
        if (!description) return showToast('Введите описание', 'warning')
        if (!ingredientsText) return showToast('Введите ингредиенты', 'warning')
        if (!instructions) return showToast('Введите инструкцию', 'warning')
        if (!cooking_time || cooking_time < 1) return showToast('Введите корректное время', 'warning')

        const ingredients = ingredientsText.split('\n').filter(i => i.trim())

        const response = await apiRequest('/recipes/', 'POST', {
            title, description: description || '', ingredients, instructions, category, cooking_time
        })

        if (response.ok) {
            showToast('Рецепт создан! 🎉', 'success')
            setTimeout(() => {
                window.location.href = 'recipes.html'
            }, 800)
        } else {
            const errorData = await response.json()
            const errorMessage = getErrorMessage(errorData)
            showToast('Ошибка: ' + errorMessage, 'error')
        }
    } catch (error) {
        const errorMessage = error.message || JSON.stringify(error)
        showToast('Ошибка: ' + errorMessage, 'error')
    }
}

// ===== УДАЛЕНИЕ =====
async function deleteRecipe(id) {
    if (!confirm('Удалить рецепт?')) return
    try {
        const response = await apiRequest(`/recipes/${id}`, 'DELETE')
        if (response.ok) {
            showToast('Рецепт удалён!', 'success')
            loadRecipes()
        } else {
            const errorData = await response.json()
            const errorMessage = getErrorMessage(errorData)
            showToast('Ошибка: ' + errorMessage, 'error')
        }
    } catch (error) {
        const errorMessage = error.message || JSON.stringify(error)
        showToast('Ошибка: ' + errorMessage, 'error')
    }
}

// ===== ПОЛУЧЕНИЕ ОДНОГО РЕЦЕПТА =====
async function getRecipe(id) {
    try {
        const response = await apiRequest(`/recipes/${id}`, 'GET')
        if (!response.ok) {
            const errorData = await response.json()
            const errorMessage = getErrorMessage(errorData)
            showToast('Ошибка: ' + errorMessage, 'error')
            return null
        }
        return await response.json()
    } catch (error) {
        const errorMessage = error.message || JSON.stringify(error)
        showToast('Ошибка: ' + errorMessage, 'error')
    }
}

// ===== ДЕТАЛЬНАЯ СТРАНИЦА =====
async function loadRecipeDetail(id) {
    const container = document.getElementById('recipe-detail')
    if (!container) return

    const recipe = await getRecipe(id)
    if (!recipe) {
        container.innerHTML = `<div class="text-white text-center"><h1>Рецепт не найден</h1><a href="recipes.html" class="btn btn-accent">Назад</a></div>`
        return
    }

    container.innerHTML = `
        <div class="text-white">
            <h1>${recipe.title}</h1>
            <p>${recipe.description || ''}</p>
            <p><strong>Категория:</strong> ${recipe.category}</p>
            <p><strong>Время:</strong> ${recipe.cooking_time} мин</p>
            <p><strong>Автор:</strong> ${recipe.user_name || 'Неизвестен'}</p>
            <h3>📝 Ингредиенты</h3>
            <ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
            <h3>📖 Инструкция</h3>
            <p>${recipe.instructions}</p>
            <a href="edit-recipe.html?id=${recipe.id}" class="btn btn-primary">✏️ Редактировать</a>
            <button onclick="deleteRecipe(${recipe.id})" class="btn btn-danger">🗑️ Удалить</button>
            <a href="recipes.html" class="btn btn-outline-light">← Назад</a>
        </div>
    `
}

// ===== РЕДАКТИРОВАНИЕ =====
let currentRecipeId = null

async function loadRecipeToEdit(id) {
    const recipe = await getRecipe(id)
    if (!recipe) {
        showToast('Рецепт не найден', 'error')
        window.location.href = 'recipes.html'
        return
    }
    currentRecipeId = recipe.id
    document.getElementById('recipe_title').value = recipe.title
    document.getElementById('recipe_description').value = recipe.description || ''
    document.getElementById('recipe_ingredients').value = recipe.ingredients.join('\n')
    document.getElementById('recipe_instructions').value = recipe.instructions
    document.getElementById('recipe_category').value = recipe.category
    document.getElementById('recipe_cooking_time').value = recipe.cooking_time
}

async function updateRecipeFromForm() {
    try {
        const title = document.getElementById('recipe_title').value
        const description = document.getElementById('recipe_description').value
        const ingredientsText = document.getElementById('recipe_ingredients').value
        const instructions = document.getElementById('recipe_instructions').value
        const category = document.getElementById('recipe_category').value
        const cooking_time = parseInt(document.getElementById('recipe_cooking_time').value)

        if (!title) return showToast('Введите название', 'warning')
        if (!description) return showToast('Введите описание', 'warning')
        if (!ingredientsText) return showToast('Введите ингредиенты', 'warning')
        if (!instructions) return showToast('Введите инструкцию', 'warning')
        if (!cooking_time || cooking_time < 1) return showToast('Введите корректное время', 'warning')

        const ingredients = ingredientsText.split('\n').filter(i => i.trim())

        const response = await apiRequest(`/recipes/${currentRecipeId}`, 'PUT', {
            title, description: description || '', ingredients, instructions, category, cooking_time
        })

        if (response.ok) {
            showToast('Рецепт обновлён! 🎉', 'success')
            setTimeout(() => {
                window.location.href = 'recipes.html'
            }, 800)
        } else {
            const errorData = await response.json()
            const errorMessage = getErrorMessage(errorData)
            showToast('Ошибка: ' + errorMessage, 'error')
        }
    } catch (error) {
        const errorMessage = error.message || JSON.stringify(error)
        showToast('Ошибка: ' + errorMessage, 'error')
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ СТРАНИЦ =====
function initRecipeDetailPage() {
    const id = new URLSearchParams(window.location.search).get('id')
    if (id) loadRecipeDetail(id)
}

function initEditRecipePage() {
    const id = new URLSearchParams(window.location.search).get('id')
    if (id) loadRecipeToEdit(id)
}