import axios from 'axios'
import useAuthStore from '../store/authStore'

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log the request for debugging
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      data: config.data
    })
    
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    })
    return response
  },
  (error) => {
    // Log errors for debugging
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data
    })
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      console.error('Backend server is not running or unreachable')
      // You could show a toast notification here
    }
    
    return Promise.reject(error)
  }
)

export default api

// Helper function to test API connection
export const testConnection = async () => {
  try {
    const response = await api.get('/health')
    return { success: true, data: response.data }
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      details: error.response?.data || 'Server unreachable'
    }
  }
}

// Helper function to test database connection
export const testDatabase = async () => {
  try {
    const response = await api.get('/db-test')
    return { success: true, data: response.data }
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      details: error.response?.data || 'Database test failed'
    }
  }
}
