// API configuration for different environments
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.origin ? '/api' : 'http://localhost:8001')

export { API_BASE_URL }