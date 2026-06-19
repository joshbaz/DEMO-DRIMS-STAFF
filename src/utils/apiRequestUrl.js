import axios from 'axios'

//export const BASE_API_URL = 'http://localhost:5000/api/v1';
export const BASE_API_URL = 'https://drimsapi.umi.ac.ug/api/v1';

//export const BASE_API_URL = 'https://drimsapi.alero.digital/api/v1';
//export const socketUrl = "https://drimsapi.alero.digital"
//export const socketUrl = "localhost:5000"
export const socketUrl = "https://drimsapi.umi.ac.ug"

const apiRequest = axios.create({
    baseURL: BASE_API_URL,
    withCredentials: true,
})

apiRequest.interceptors.request.use((config) => {
    const token = localStorage.getItem('umi_auth_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    // Only set Content-Type to application/json if it's not already set and not a blob request
    if (!config.headers["Content-Type"] && config.responseType !== 'blob') {
        config.headers["Content-Type"] = "application/json"
    }
    return config
})

apiRequest.interceptors.response.use((response) => response, (error) => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("role")
        localStorage.removeItem("umi_auth_token")
        localStorage.removeItem("umi_auth_state")
        if (window.location.pathname !== "/login") {
            window.location.href = "/login"
        }
    }
    return Promise.reject(error)
})

export default apiRequest 