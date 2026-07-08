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
            const error = await response.json()
            alert('Ошибка: ' + (error.detail || 'Неизвестная ошибка'))
        }
    } catch (error) {
        console.error('Ошибка загрузки рецептов:', error)
        alert('Ошибка загрузки рецептов')
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
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${recipe.title}</h5>
                    <p class="card-text">${recipe.description || ''}</p>
                    <p><small>Категория: ${recipe.category}</small></p>
                    <p><small>⏱ ${recipe.cooking_time} мин</small></p>
                    <p><small>👤 ${recipe.user_name || 'Неизвестен'}</small></p>
                    <a href="recipe-detail.html?id=${recipe.id}" class="btn btn-info btn-sm">📖 Подробнее</a>
                    <a href="edit-recipe.html?id=${recipe.id}" class="btn btn-primary btn-sm">✏️ Редактировать</a>
                    <button onclick="deleteRecipe(${recipe.id})" class="btn btn-danger btn-sm">🗑️ Удалить</button>
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

        if (!title) return alert('Введите название')
        if (!ingredientsText) return alert('Введите ингредиенты')
        if (!instructions) return alert('Введите инструкцию')
        if (!cooking_time || cooking_time < 1) return alert('Введите корректное время')

        const ingredients = ingredientsText.split('\n').filter(i => i.trim())

        const response = await apiRequest('/recipes/', 'POST', {
            title, description: description || '', ingredients, instructions, category, cooking_time
        })

        if (response.ok) {
            alert('Рецепт создан! 🎉')
            window.location.href = 'recipes.html'
        } else {
            const error = await response.json()
            alert('Ошибка: ' + (error.detail || 'Неизвестная ошибка'))
        }
    } catch (e) {
        console.error(e)
        alert('Ошибка создания рецепта')
    }
}

// ===== УДАЛЕНИЕ =====
async function deleteRecipe(id) {
    if (!confirm('Удалить рецепт?')) return
    try {
        const response = await apiRequest(`/recipes/${id}/`, 'DELETE')
        if (response.ok) {
            alert('Рецепт удалён!')
            loadRecipes()
        } else {
            const error = await response.json()
            alert('Ошибка: ' + (error.detail || 'Неизвестная ошибка'))
        }
    } catch (e) {
        console.error(e)
        alert('Ошибка удаления')
    }
}

// ===== ПОЛУЧЕНИЕ ОДНОГО РЕЦЕПТА =====
async function getRecipe(id) {
    try {
        const response = await apiRequest(`/recipes/${id}/`, 'GET')
        if (!response.ok) {
            const error = await response.json()
            alert('Ошибка: ' + (error.detail || 'Неизвестная ошибка'))
            return null
        }
        return await response.json()
    } catch (e) {
        console.error(e)
        alert('Ошибка загрузки рецепта')
        return null
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
        alert('Рецепт не найден')
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

        if (!title) return alert('Введите название')
        if (!ingredientsText) return alert('Введите ингредиенты')
        if (!instructions) return alert('Введите инструкцию')
        if (!cooking_time || cooking_time < 1) return alert('Введите корректное время')

        const ingredients = ingredientsText.split('\n').filter(i => i.trim())

        const response = await apiRequest(`/recipes/${currentRecipeId}/`, 'PUT', {
            title, description: description || '', ingredients, instructions, category, cooking_time
        })

        if (response.ok) {
            alert('Рецепт обновлён! 🎉')
            window.location.href = 'recipes.html'
        } else {
            const error = await response.json()
            alert('Ошибка: ' + (error.detail || 'Неизвестная ошибка'))
        }
    } catch (e) {
        console.error(e)
        alert('Ошибка обновления рецепта')
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