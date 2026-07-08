checkAuth()

loadRecipes()

const searchInput = document.getElementById('searchInput')
const categoryFilter = document.getElementById('categoryFilter')
const searchBtn = document.getElementById('searchBtn')

// Поиск при вводе
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const search = this.value
        const category = categoryFilter ? categoryFilter.value : ''
        loadRecipes(search, category)
    })
}

// Фильтр при смене категории
if (categoryFilter) {
    categoryFilter.addEventListener('change', function() {
        const category = this.value
        const search = searchInput ? searchInput.value : ''
        loadRecipes(search, category)
    })
}

if (searchBtn) {
    searchBtn.addEventListener('click', function() {
        const search = searchInput ? searchInput.value : ''
        const category = categoryFilter ? categoryFilter.value : ''
        loadRecipes(search, category)
    })
}