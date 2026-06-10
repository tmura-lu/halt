import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

// Inject CSRF token on mutating requests
api.interceptors.request.use((config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    const csrfToken = getCookie('csrftoken')
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken
    }
  }
  return config
})

// Do NOT auto-redirect on 401 here.
// AuthContext sets user=null and ProtectedRoute handles the redirect to /login.
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const getMe = () => api.get('/me/')

// ── Feed ─────────────────────────────────────────────────────────────────────
// Backend: GET /api/feed/?cursor=<iso_datetime>  → { results, next_cursor, has_more }
export const getFeed       = (cursor = null) => api.get('/feed/', { params: cursor ? { cursor } : {} })
export const likePost      = (id)            => api.post(`/posts/${id}/like/`)
export const unlikePost    = (id)            => api.post(`/posts/${id}/like/`)   // toggle endpoint
export const getComments   = (id)            => api.get(`/posts/${id}/comentarios/`)
export const addComment    = (id, text)      => api.post(`/posts/${id}/comentarios/`, { mensagem: text })
export const createComment = (id, text)      => api.post(`/posts/${id}/comentarios/`, { mensagem: text })

// ── Stories ───────────────────────────────────────────────────────────────────
// Backend: GET /api/stories/ → { results: [...users], me: {...} }
export const getStories = () => api.get('/stories/')

// ── Workouts / Templates ──────────────────────────────────────────────────────
// Backend: GET /api/workout/templates/ → { my_templates, community_templates }
export const getTemplates          = ()           => api.get('/workout/templates/')
export const getWorkoutTemplates   = ()           => api.get('/workout/templates/')
export const createTemplate        = (data)       => api.post('/workout/templates/', data)
export const createWorkoutTemplate = (data)       => api.post('/workout/templates/', data)

// ── Exercícios ────────────────────────────────────────────────────────────────
export const getExercicios = () => api.get('/exercicios/')

// ── Alerts / Notifications ───────────────────────────────────────────────────
// Backend: GET /api/notifications/ → { unread_count, today, earlier }
export const getAlerts                = () => api.get('/notifications/')
export const getNotifications         = () => api.get('/notifications/')
export const markAllRead              = () => api.post('/notifications/mark-all-read/')
export const markAllNotificationsRead = () => api.post('/notifications/mark-all-read/')

// ── Profile ──────────────────────────────────────────────────────────────────
// Backend: GET /api/profile/ → current user full profile
export const getMyProfile  = () => api.get('/profile/')
export const updateProfile = (data) => api.patch('/profile/', data)

export default api
