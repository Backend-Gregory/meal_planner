let currentPage = 0
const limit = 12

async function loadRecipesWithPagination(search = '', category = '') {
    const skip = currentPage * limit
    
    try {
        const params = new URLSearchParams()
        if (search) params.append('search', search)
        if (category) params.append('category', category)
        params.append('skip', skip)
        params.append('limit', limit + 1)

        const response = await apiRequest(`/recipes/?${params.toString()}`, 'GET')
        if (response.ok) {
            const recipes = await response.json()
            
            const hasNext = recipes.length > limit
            const displayRecipes = hasNext ? recipes.slice(0, limit) : recipes
            
            renderRecipes(displayRecipes)
            updatePaginationButtons(hasNext)
            
            window._hasNext = hasNext
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

function updatePaginationButtons(hasNext) {
    const prevBtn = document.getElementById('prevPageBtn')
    const nextBtn = document.getElementById('nextPageBtn')
    
    // Кнопка "Назад" — только если не первая страница
    if (currentPage === 0) {
        prevBtn.style.display = 'none'
    } else {
        prevBtn.style.display = 'inline-flex'
    }
    
    // Кнопка "Вперёд" — только если есть следующая страница
    if (hasNext) {
        nextBtn.style.display = 'inline-flex'
    } else {
        nextBtn.style.display = 'none'
    }
}

function goToPreviousPage() {
    if (currentPage > 0) {
        currentPage--
        const search = document.getElementById('searchInput')?.value || ''
        const category = document.getElementById('categoryFilter')?.value || ''
        loadRecipesWithPagination(search, category)
    }
}

function goToNextPage() {
    if (window._hasNext) {
        currentPage++
        const search = document.getElementById('searchInput')?.value || ''
        const category = document.getElementById('categoryFilter')?.value || ''
        loadRecipesWithPagination(search, category)
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', async function() {
    await checkAuth()
    await updateNavbar()
    
    loadRecipesWithPagination()
    
    const searchInput = document.getElementById('searchInput')
    const categoryFilter = document.getElementById('categoryFilter')
    const searchBtn = document.getElementById('searchBtn')
    
    let searchTimeout
    
    searchInput?.addEventListener('input', function() {
        clearTimeout(searchTimeout)
        searchTimeout = setTimeout(() => {
            currentPage = 0
            loadRecipesWithPagination(this.value, categoryFilter?.value || '')
        }, 300)
    })
    
    categoryFilter?.addEventListener('change', function() {
        currentPage = 0
        loadRecipesWithPagination(searchInput?.value || '', this.value)
    })
    
    searchBtn?.addEventListener('click', function() {
        currentPage = 0
        loadRecipesWithPagination(searchInput?.value || '', categoryFilter?.value || '')
    })
    
    document.getElementById('prevPageBtn')?.addEventListener('click', goToPreviousPage)
    document.getElementById('nextPageBtn')?.addEventListener('click', goToNextPage)
})