// Utility to check authentication and get admin role
export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

export function getAdminRole() {
  return localStorage.getItem('adminType') || localStorage.getItem('role');
}

export function logout() {
  localStorage.clear();
  window.location.href = '/admin';
}

let sessionTimeoutId;
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function startSessionTimer() {
  clearTimeout(sessionTimeoutId);
  sessionTimeoutId = setTimeout(() => {
    logout();
    alert('Session expired. Please log in again.');
  }, SESSION_TIMEOUT);
}

export function resetSessionTimer() {
  clearTimeout(sessionTimeoutId);
  startSessionTimer();
} 