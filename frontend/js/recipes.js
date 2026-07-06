async function loadRecipes(search = '', category = '', skip = 0, limit = 10) {
    try {
        const params = new URLSearchParams()
        if (search) params.append('search', search)
        if (category) params.append('category', category)
        params.append('skip', skip)
        params.append('limit', limit)

        const url = `/recipes?${params.toString()}`
        const response = await apiRequest(url, 'GET')

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
                    <button class="btn btn-info btn-sm" onclick="window.location.href='recipe-detail.html?id=${recipe.id}'">📖 Подробнее</button>
                    <button class="btn btn-primary btn-sm" onclick="window.location.href='edit-recipe.html?id=${recipe.id}'">✏️ Редактировать</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteRecipe(${recipe.id})">🗑️ Удалить</button>
                </div>
            </div>
        </div>
    `).join('')
    recipesContainer.innerHTML = html
}

async function createRecipe() {
    try {
        const title = document.querySelector('#recipe_title').value
        const description = document.querySelector('#recipe_description').value
        const ingredientsText = document.querySelector('#recipe_ingredients').value
        const instructions = document.querySelector('#recipe_instructions').value
        const category = document.querySelector('#recipe_category').value
        const cooking_time = parseInt(document.querySelector('#recipe_cooking_time').value)

        switch (true) {
            case !title:
                alert('Введите название рецепта')
                return
            case !description:
                alert('Введите описание рецепта')
                return
            case !ingredientsText:
                alert('Введите ингредиенты рецепта')
                return
            case !instructions:
                alert('Введите инструкции рецепта')
                return
            case !category:
                alert('Выберите категорию рецепта')
                return
            case isNaN(cooking_time):
                alert('Введите корректное время приготовления')
                return
        }

        const ingredients = ingredientsText
        .split('\n')
        .filter(ingredient => ingredient.trim() !== '')

        const data = {
            title: title,
            description: description || '',
            ingredients: ingredients,
            instructions: instructions,
            category: category,
            cooking_time: cooking_time
        }

        const response = await apiRequest('/recipes', 'POST', data)

        if (response.ok) {
            alert('Рецепт создан! 🎉')
            window.location.href = 'recipes.html'
        } else{
            const error = await response.json()
            alert('Ошибка: ' + (error.detail || 'Неизвестная ошибка'))
        }

    }
    catch (error) {
        console.error('Ошибка создания рецепта:', error)
        alert('Ошибка создания рецепта')
    }
}

async function deleteRecipe(recipeId) {
    if (!confirm('Вы уверены, что хотите удалить этот рецепт?')) return
    
    try {
    const response = await apiRequest(`/recipes/${recipeId}`, 'DELETE')
    if (response.ok) {
        alert('Рецепт удален! 🎉')
        loadRecipes()
    } else {
        const error = await response.json()
        alert('Ошибка: ' + (error.detail || 'Неизвестная ошибка'))
    }
    } catch (error) {
        console.error('Ошибка удаления рецепта:', error)
        alert('Ошибка удаления рецепта')
    }
}

async function getRecipe(id) {
    try {
        const response = await apiRequest(`/recipes/${id}`, 'GET')

        if (response.ok) {
            return await response.json()
        } else {
            const error = await response.json()
            alert('Ошибка: ' + (error.detail || 'Неизвестная ошибка'))
            return null
        }
    } catch (error) {
        console.error('Ошибка загрузки рецепта:', error)
        alert('Ошибка загрузки рецепта')
        return null
    }
}

async function loadRecipeDetail(id) {
    try {
        const recipe = await getRecipe(id)
        if (!recipe) {
            document.querySelector('#recipe-detail').innerHTML = `
                <div class="text-center text-white">
                    <h1>Рецепт не найден</h1>
                    <a href="recipes.html" class="btn btn-accent mt-3">Вернуться к рецептам</a>
                </div>
            `
            return
        }

        const html = `
            <div class="text-white">
                <h1 class="display-4">${recipe.title}</h1>
                <p class="lead">${recipe.description || 'Без описания'}</p>
                <hr>
                <p><strong>Категория:</strong> ${recipe.category}</p>
                <p><strong>Время приготовления:</strong> ${recipe.cooking_time} мин</p>
                <p><strong>Автор:</strong> ${recipe.user_name || 'Неизвестен'}</p>
                <h3 class="mt-4">📝 Ингредиенты</h3>
                <ul class="list-unstyled">
                    ${recipe.ingredients.map(ing => `<li>• ${ing}</li>`).join('')}
                </ul>
                <h3 class="mt-4">📖 Инструкция</h3>
                <p>${recipe.instructions}</p>
                <div class="mt-4">
                    <a href="edit-recipe.html?id=${recipe.id}" class="btn btn-primary">✏️ Редактировать</a>
                    <button onclick="deleteRecipe(${recipe.id})" class="btn btn-danger">🗑️ Удалить</button>
                    <a href="recipes.html" class="btn btn-outline-light">← Назад</a>
                </div>
            </div>
        `

        document.querySelector('#recipe-detail').innerHTML = html
    } catch (error) {
        console.error('Ошибка загрузки деталей рецепта:', error)
        alert('Ошибка загрузки рецепта')
    }
}

let currentRecipeId = null

async function loadRecipeToEdit(id) {
    try {
        const recipe = await getRecipe(id)
        if (!recipe) {
            alert('Рецепт не найден')
            window.location.href = 'recipes.html'
            return
        }

        currentRecipeId = recipe.id

        document.querySelector('#recipe_title').value = recipe.title
        document.querySelector('#recipe_description').value = recipe.description || ''
        document.querySelector('#recipe_ingredients').value = recipe.ingredients.join('\n')
        document.querySelector('#recipe_instructions').value = recipe.instructions
        document.querySelector('#recipe_category').value = recipe.category
        document.querySelector('#recipe_cooking_time').value = recipe.cooking_time

    } catch (error) {
        console.error('Ошибка загрузки рецепта для редактирования:', error)
        alert('Ошибка загрузки рецепта')
    }
}

async function updateRecipeFromForm() {
    try {
        const title = document.querySelector('#recipe_title').value
        const description = document.querySelector('#recipe_description').value
        const ingredientsText = document.querySelector('#recipe_ingredients').value
        const instructions = document.querySelector('#recipe_instructions').value
        const category = document.querySelector('#recipe_category').value
        const cooking_time = parseInt(document.querySelector('#recipe_cooking_time').value)

        if (!title) {
            alert('Введите название рецепта')
            return
        }
        if (!ingredientsText) {
            alert('Введите ингредиенты')
            return
        }
        if (!instructions) {
            alert('Введите инструкцию')
            return
        }
        if (!cooking_time || cooking_time <= 0) {
            alert('Введите корректное время приготовления')
            return
        }

        const ingredients = ingredientsText
            .split('\n')
            .filter(item => item.trim() !== '')

        const data = {
            title: title,
            description: description || '',
            ingredients: ingredients,
            instructions: instructions,
            category: category,
            cooking_time: cooking_time
        }

        const response = await apiRequest(`/recipes/${currentRecipeId}`, 'PUT', data)

        if (response.ok) {
            alert('Рецепт обновлён! 🎉')
            window.location.href = 'recipes.html'
        } else {
            const error = await response.json()
            alert('Ошибка: ' + (error.detail || 'Неизвестная ошибка'))
        }
    } catch (error) {
        console.error('Ошибка обновления рецепта:', error)
        alert('Ошибка обновления рецепта')
    }
}

function initEditRecipePage() {
    const params = new URLSearchParams(window.location.search)
    const recipeId = params.get('id')
    
    if (recipeId) {
        loadRecipeToEdit(recipeId)
    } else {
        alert('Рецепт не найден')
        window.location.href = 'recipes.html'
    }
}

function initRecipeDetailPage() {
    const params = new URLSearchParams(window.location.search)
    const recipeId = params.get('id')
    if (recipeId) {
        loadRecipeDetail(recipeId)
    } else {
        document.querySelector('#recipe-detail').innerHTML = `
        <div class="text-center text-white">
            <h1>Рецепт не найден</h1>
        <a href="recipes.html" class="btn btn-accent mt-3">Вернуться к рецептам</a>
        </div>
        `
    }
}                