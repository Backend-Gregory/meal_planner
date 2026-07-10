const API_BASE = '/api'

function getToken() {
    return localStorage.getItem('access_token')
}

function getRefreshToken() {
    return localStorage.getItem('refresh_token')
}

function saveTokens(access, refresh) {
    if (access) localStorage.setItem('access_token', access)
    if (refresh) localStorage.setItem('refresh_token', refresh)
}

function clearTokens() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
}

async function refreshAccessToken() {
    const refresh = getRefreshToken()
    if (!refresh) return false

    try {
        const response = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refresh })
        })

        if (response.ok) {
            const data = await response.json()
            saveTokens(data.access_token, data.refresh_token)
            return true
        } else {
            clearTokens()
            window.location.href = '/login.html'
            return false
        }
    } catch (e) {
        console.error('Refresh error:', e)
        clearTokens()
        window.location.href = '/login.html'
        return false
    }
}

async function apiRequest(endpoint, method = 'GET', data = null, retry = true) {
    const fullURL = `${API_BASE}${endpoint}`
    const token = getToken()
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const config = { method, headers }
    if (data) config.body = JSON.stringify(data)

    const response = await fetch(fullURL, config)

    if (response.status === 401 && retry) {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
            return apiRequest(endpoint, method, data, false)
        }
    }

    return response
}

function showToast(message, type = 'info') {
    alert(message)
}