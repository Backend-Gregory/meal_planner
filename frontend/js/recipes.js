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
                    <button class="btn btn-primary btn-sm">Редактировать</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteRecipe(${recipe.id})">Удалить</button>
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