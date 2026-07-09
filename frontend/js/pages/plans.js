document.addEventListener('DOMContentLoaded', async function() {
    await checkAuth()
    loadRecipesForPlan()
    loadCurrentPlan()

    const weekPicker = document.getElementById('weekPicker')
    const currentWeekBtn = document.getElementById('currentWeekBtn')
    const prevWeekBtn = document.getElementById('prevWeekBtn')
    const nextWeekBtn = document.getElementById('nextWeekBtn')

    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1)
    weekPicker.value = monday.toISOString().split('T')[0]

    weekPicker.addEventListener('change', function() {
        const date = this.value
        if (date) loadPlanByWeek(date)
    })

    currentWeekBtn.addEventListener('click', function() {
        const today = new Date()
        const monday = new Date(today)
        monday.setDate(today.getDate() - today.getDay() + 1)
        weekPicker.value = monday.toISOString().split('T')[0]
        loadCurrentPlan()
    })

    prevWeekBtn.addEventListener('click', function() {
        const currentDate = new Date(weekPicker.value)
        currentDate.setDate(currentDate.getDate() - 7)
        weekPicker.value = currentDate.toISOString().split('T')[0]
        loadPlanByWeek(weekPicker.value)
    })


    nextWeekBtn.addEventListener('click', function() {
        const currentDate = new Date(weekPicker.value)
        currentDate.setDate(currentDate.getDate() + 7)
        weekPicker.value = currentDate.toISOString().split('T')[0]
        loadPlanByWeek(weekPicker.value)
    })

    document.getElementById('copyPlanBtn').addEventListener('click', copyPlan)
    document.getElementById('createPlanBtn').addEventListener('click', function() {
        window.location.href = 'create-plan.html'
    })
})