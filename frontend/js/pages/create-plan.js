async function initCreatePlan() {
    await loadRecipesForPlan()
    renderPlanForm(recipesCache)
}

function renderPlanForm(recipes) {
    const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
    const container = document.getElementById('daysContainer')
    const mealTypes = [
        { key: 'breakfast', label: '🍳 Завтрак' },
        { key: 'lunch', label: '🥗 Обед' },
        { key: 'dinner', label: '🍽 Ужин' }
    ]

    let html = ''
    days.forEach((day, index) => {
        html += `
            <div class="card bg-dark bg-opacity-25 border-secondary mb-3">
                <div class="card-body">
                    <h5 class="card-title text-white">${day}</h5>
                    <input type="hidden" name="day_of_week" value="${index}">
                    ${mealTypes.map(meal => `
                        <div class="mb-2">
                            <label class="form-label text-white-50">${meal.label}</label>
                            <select class="form-select" name="meal_${meal.key}_${index}">
                                <option value="">— Не выбрано —</option>
                                ${recipes.map(r => `
                                    <option value="${r.id}">${r.title}</option>
                                `).join('')}
                            </select>
                        </div>
                    `).join('')}
                </div>
            </div>
        `
    })

    container.innerHTML = html
}

document.getElementById('createPlanForm').addEventListener('submit', async function(e) {
    e.preventDefault()

    const weekStart = document.getElementById('weekStart').value
    if (!weekStart) {
        alert('Выберите дату начала недели')
        return
    }

    const days = []
    const dayCards = document.querySelectorAll('#daysContainer .card')

    dayCards.forEach((card, index) => {
        const breakfast = card.querySelector(`select[name="meal_breakfast_${index}"]`).value
        const lunch = card.querySelector(`select[name="meal_lunch_${index}"]`).value
        const dinner = card.querySelector(`select[name="meal_dinner_${index}"]`).value

        days.push({
            day_of_week: index,
            breakfast_recipe_id: breakfast ? parseInt(breakfast) : null,
            lunch_recipe_id: lunch ? parseInt(lunch) : null,
            dinner_recipe_id: dinner ? parseInt(dinner) : null
        })
    })

    await createPlan(weekStart, days)
})

document.addEventListener('DOMContentLoaded', async function() {
    await checkAuth()
    initCreatePlan()
})