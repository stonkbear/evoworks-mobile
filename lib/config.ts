/**
 * App Configuration
 * Handles API URLs for web vs mobile builds
 */

// API Base URL - changes based on environment
export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? '' 
    : 'https://evoworks-api.up.railway.app')

// Helper to build API URLs
export function apiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${cleanPath}`
}

// Check if running in Capacitor
export const isCapacitor = typeof window !== 'undefined' && 
  (window as any).Capacitor !== undefined

// Check if running on mobile
export const isMobile = typeof window !== 'undefined' && 
  /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

