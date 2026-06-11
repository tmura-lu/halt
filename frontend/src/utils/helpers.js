// Utility: format a date string as relative time
export function formatDistanceToNow(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date

  if (diffMs < 0) return 'just now'
  const diffSecs = Math.floor(diffMs / 1000)
  if (diffSecs < 60) return 'just now'
  const diffMins = Math.floor(diffSecs / 60)
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// Format volume: negative → '--', formats with thousands separators (e.g., 6.600 kg)
export function formatVolume(kg) {
  if (kg == null || kg < 0) return '--'
  const rounded = Math.round(kg)
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' kg'
}

// Format duration: null, negative, or >600 → '--', else 'Xmin'
export function formatDuration(mins) {
  if (mins == null || mins < 0 || mins > 600) return '--'
  return `${mins}min`
}

// Fallback avatar URL using dicebear
export function avatarUrl(user) {
  return user?.imagem_perfil_url || `https://api.dicebear.com/8.x/avataaars/svg?seed=${user?.username || 'user'}`
}
