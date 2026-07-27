// ===== КАТЕГОРИИ (РУС) =====
function getCategoryName(category) {
    const map = {
        'breakfast': '🍳 Завтрак',
        'lunch': '🥗 Обед',
        'dinner': '🍽 Ужин',
        'dessert': '🍰 Десерт',
        'snack': '🍿 Перекус'
    }
    return map[category] || category
}

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

    if (!recipes || recipes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon"><i class="fas fa-utensils"></i></span>
                <h5>Нет рецептов</h5>
                <p>Создайте свой первый рецепт и начните планировать питание!</p>
                <a href="create-recipe.html" class="btn btn-accent"><i class="fas fa-plus"></i> Создать рецепт</a>
            </div>
        `
        return
    }

    container.innerHTML = recipes.map(recipe => `
        <div class="col-md-4 mb-4 fade-in">
            <div class="recipe-card">
                <h5 class="card-title">${recipe.title}</h5>
                <p class="card-text">${recipe.description || ''}</p>
                <div class="d-flex flex-wrap gap-1 mb-2">
                    <span class="badge">${getCategoryName(recipe.category)}</span>
                    <span class="badge">⏱ ${recipe.cooking_time} мин</span>
                </div>
                <p class="card-text"><small>👤 ${recipe.user_name || 'Неизвестен'}</small></p>
                <div class="d-flex gap-2 flex-wrap">
                    <a href="recipe-detail.html?id=${recipe.id}" class="btn btn-sm btn-outline-light"><i class="fas fa-eye"></i></a>
                    <a href="edit-recipe.html?id=${recipe.id}" class="btn btn-sm btn-accent"><i class="fas fa-edit"></i></a>
                    <button onclick="deleteRecipe(${recipe.id})" class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button>
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
        container.innerHTML = `
            <div class="glass-card text-white p-4 text-center">
                <div class="empty-state">
                    <span class="empty-icon"><i class="fas fa-utensils"></i></span>
                    <h5>Рецепт не найден</h5>
                    <p>Возможно, он был удалён или у вас нет доступа.</p>
                    <a href="recipes.html" class="btn btn-accent"><i class="fas fa-arrow-left"></i> Назад к рецептам</a>
                </div>
            </div>
        `
        return
    }

    // Категории с иконками
    const categoryMap = {
        'breakfast': '🍳 Завтрак',
        'lunch': '🥗 Обед',
        'dinner': '🍽 Ужин',
        'dessert': '🍰 Десерт',
        'snack': '🍿 Перекус'
    }
    const categoryDisplay = categoryMap[recipe.category] || recipe.category

    container.innerHTML = `
        <div class="glass-card text-white p-4 fade-in">
            <!-- Шапка -->
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                <h1 class="display-6 fw-bold mb-0">${recipe.title}</h1>
                <span class="badge" style="background:rgba(233,69,96,0.15);color:#e94560;font-size:1rem;padding:6px 18px;">${categoryDisplay}</span>
            </div>

            <!-- Инфо -->
            <div class="d-flex flex-wrap gap-3 mb-4 text-muted">
                <span><i class="fas fa-user" style="color:#e94560;"></i> ${recipe.user_name || 'Неизвестен'}</span>
                <span><i class="fas fa-clock" style="color:#e94560;"></i> ${recipe.cooking_time} мин</span>
                <span><i class="fas fa-utensils" style="color:#e94560;"></i> ${recipe.ingredients?.length || 0} ингредиентов</span>
            </div>

            ${recipe.description ? `
                <div class="mb-4">
                    <p class="text-secondary" style="font-size:1.05rem;">${recipe.description}</p>
                </div>
            ` : ''}

            <hr>

            <!-- Ингредиенты -->
            <div class="row mb-4">
                <div class="col-md-6">
                    <h5 class="fw-bold mb-3"><i class="fas fa-list" style="color:#e94560;"></i> Ингредиенты</h5>
                    <ul class="list-unstyled">
                        ${recipe.ingredients?.map(i => `
                            <li class="py-1" style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                <i class="fas fa-circle" style="color:#e94560;font-size:8px;margin-right:10px;"></i>
                                ${i}
                            </li>
                        `).join('') || '<li class="text-muted">Нет ингредиентов</li>'}
                    </ul>
                </div>

                <!-- Инструкция -->
                <div class="col-md-6">
                    <h5 class="fw-bold mb-3"><i class="fas fa-book" style="color:#e94560;"></i> Инструкция</h5>
                    <div class="text-secondary" style="line-height:1.7;">
                        ${recipe.instructions ? recipe.instructions.replace(/\n/g, '<br>') : 'Нет инструкции'}
                    </div>
                </div>
            </div>

            <hr>

            <!-- Кнопки -->
            <div class="d-flex flex-wrap gap-2 mt-3">
                <a href="edit-recipe.html?id=${recipe.id}" class="btn btn-accent">
                    <i class="fas fa-edit"></i> Редактировать
                </a>
                <button onclick="deleteRecipe(${recipe.id})" class="btn btn-danger">
                    <i class="fas fa-trash"></i> Удалить
                </button>
                <a href="recipes.html" class="btn btn-outline-light">
                    <i class="fas fa-arrow-left"></i> Назад
                </a>
            </div>
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