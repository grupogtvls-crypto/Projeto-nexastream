export function getStoredToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nexastream_token');
}

export function logoutAdmin() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('nexastream_token');
  window.location.href = '/login';
}
