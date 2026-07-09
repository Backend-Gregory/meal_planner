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

// ===== ОТРИСОВКА ПЛАНА =====
function renderPlans(plans) {
    const container = document.getElementById('plans-container')
    if (!container) return

    if (!plans || plans.length === 0) {
        container.innerHTML = `
            <div class="text-center text-white py-5">
                <h3>📋 Нет плана на эту неделю</h3>
                <p class="text-light">Создайте план, чтобы начать</p>
                <a href="create-plan.html" class="btn btn-accent mt-3">+ Создать план</a>
            </div>
        `
        return
    }

    // Группируем по дням недели
    const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
    const grouped = {}

    plans.forEach(plan => {
        const dayName = days[plan.day_of_week] || `День ${plan.day_of_week + 1}`
        if (!grouped[dayName]) grouped[dayName] = { plans: [] }
        grouped[dayName].plans.push(plan)
    })

    let html = `<div class="row">`
    for (const [dayName, data] of Object.entries(grouped)) {
        const mealTypes = {
            breakfast: '🍳 Завтрак',
            lunch: '🥗 Обед',
            dinner: '🍽 Ужин'
        }

        html += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card glass-card text-white">
                    <div class="card-body">
                        <h4 class="card-title text-center">${dayName}</h4>
                        <hr>
                `

        for (const meal of ['breakfast', 'lunch', 'dinner']) {
            const plan = data.plans.find(p => p.meal_type === meal)
            if (plan) {
                html += `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span>${mealTypes[meal]}</span>
                        <span class="badge bg-info">${getRecipeTitle(plan.recipe_id)}</span>
                        <button onclick="deletePlan(${plan.id})" class="btn btn-danger btn-sm">🗑️</button>
                    </div>
                `
            } else {
                html += `
                    <div class="d-flex justify-content-between align-items-center mb-2 text-light opacity-50">
                        <span>${mealTypes[meal]}</span>
                        <span class="text-muted">Не выбран</span>
                    </div>
                `
            }
        }

        html += `
                    <div class="mt-3 text-center">
                        <button class="btn btn-sm btn-accent" onclick="openEditPlan('${dayName}', '${data.plans[0].week_start}')">✏️ Изменить</button>
                    </div>
                </div>
            </div>
        </div>
        `
    }
    html += `</div>`

    container.innerHTML = html
}

// ===== СОЗДАНИЕ ПЛАНА =====
async function createPlan(weekStart, daysData) {
    try {
        const response = await apiRequest('/plans/', 'POST', {
            week_start: weekStart,
            days: daysData
        })
        if (response.ok) {
            alert('План создан! 🎉')
            loadCurrentPlan()
        } else {
            const error = await response.json()
            alert('Ошибка: ' + (error.detail || 'Неизвестная ошибка'))
        }
    } catch (e) {
        console.error('Ошибка создания плана:', e)
        alert('Ошибка создания плана')
    }
}

// ===== КОПИРОВАНИЕ ПЛАНА =====
async function copyPlan() {
    if (!confirm('Скопировать план на следующую неделю?')) return
    try {
        const response = await apiRequest('/plans/copy', 'POST')
        if (response.ok) {
            alert('План скопирован! 📋')
            loadCurrentPlan()
        } else {
            const error = await response.json()
            alert('Ошибка: ' + (error.detail || 'Неизвестная ошибка'))
        }
    } catch (e) {
        console.error('Ошибка копирования плана:', e)
        alert('Ошибка копирования плана')
    }
}

// ===== УДАЛЕНИЕ ПЛАНА =====
async function deletePlan(id) {
    if (!confirm('Удалить этот приём пищи?')) return
    try {
        const response = await apiRequest(`/plans/${id}`, 'DELETE')
        if (response.ok) {
            alert('Удалено!')
            loadCurrentPlan()
        } else {
            const error = await response.json()
            alert('Ошибка: ' + (error.detail || 'Неизвестная ошибка'))
        }
    } catch (e) {
        console.error('Ошибка удаления плана:', e)
        alert('Ошибка удаления плана')
    }
}

// ===== ЗАГРУЗКА ПЛАНА ПО НЕДЕЛЕ =====
async function loadPlanByWeek(weekStart) {
    try {
        const response = await apiRequest(`/plans/${weekStart}`, 'GET')
        if (response.ok) {
            const plans = await response.json()
            renderPlans(plans)
        } else {
            const error = await response.json()
            alert('Ошибка: ' + (error.detail || 'Неизвестная ошибка'))
        }
    } catch (e) {
        console.error('Ошибка загрузки плана по неделе:', e)
        alert('Ошибка загрузки плана')
    }
}

// ===== РЕДАКТИРОВАНИЕ ПЛАНА =====
let editPlanDay = null
let editPlanWeek = null

function openEditPlan(dayName, weekStart) {
    editPlanDay = dayName
    editPlanWeek = weekStart

    const container = document.getElementById('plans-container')
    const dayCards = container.querySelectorAll('.card')
    let targetCard = null

    dayCards.forEach(card => {
        if (card.querySelector('.card-title')?.textContent === dayName) {
            targetCard = card
        }
    })

    if (!targetCard) {
        alert('День не найден')
        return
    }

    const meals = targetCard.querySelectorAll('.d-flex')
    const mealData = {}
    meals.forEach(meal => {
        const label = meal.querySelector('span:first-child')?.textContent?.trim() || ''
        const value = meal.querySelector('.badge')?.textContent || ''
        const mealType = label.includes('Завтрак') ? 'breakfast' :
                        label.includes('Обед') ? 'lunch' :
                        label.includes('Ужин') ? 'dinner' : null
        if (mealType) {
            mealData[mealType] = value !== 'Не выбран' ? value : null
        }
    })

    showEditForm(dayName, mealData)
}

function showEditForm(dayName, mealData) {
    const body = document.getElementById('editPlanBody')
    const mealTypes = [
        { key: 'breakfast', label: '🍳 Завтрак' },
        { key: 'lunch', label: '🥗 Обед' },
        { key: 'dinner', label: '🍽 Ужин' }
    ]

    let html = `<h5>${dayName}</h5><hr>`
    mealTypes.forEach(meal => {
        const selected = mealData[meal.key] || ''
        html += `
            <div class="mb-3">
                <label class="form-label">${meal.label}</label>
                <select class="form-select" id="edit_${meal.key}">
                    <option value="">— Не выбрано —</option>
                    ${recipesCache.map(r => `
                        <option value="${r.id}" ${r.id == selected ? 'selected' : ''}>${r.title}</option>
                    `).join('')}
                </select>
            </div>
        `
    })

    html += `
        <button class="btn btn-accent w-100" onclick="saveEditPlan()">💾 Сохранить</button>
    `

    body.innerHTML = html

    const modal = new bootstrap.Modal(document.getElementById('editPlanModal'))
    modal.show()
}
