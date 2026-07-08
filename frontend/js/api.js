const API_BASE = '/api'

function get_token() {
    return localStorage.getItem('token')
}

async function apiRequest(endpoint, method = 'GET', data = null) {
    const fullURL = API_BASE + endpoint
    const token = get_token()
    const headers = {
        'Content-Type': 'application/json'
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const config = {
        method,
        headers
    };

    if (data) {
        config.body = JSON.stringify(data)
    }

    const response = await fetch(`${fullURL}`, config)
    return response
}