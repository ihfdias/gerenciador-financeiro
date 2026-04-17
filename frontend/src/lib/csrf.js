const CSRF_COOKIE_NAME = 'financeiro_csrf';
let csrfTokenMemory = '';

export function setCsrfToken(token) {
  csrfTokenMemory = typeof token === 'string' ? token : '';
}

export function clearCsrfToken() {
  csrfTokenMemory = '';
}

export function getCsrfToken() {
  if (csrfTokenMemory) {
    return csrfTokenMemory;
  }

  const cookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CSRF_COOKIE_NAME}=`));

  if (!cookie) {
    return '';
  }

  const token = decodeURIComponent(cookie.slice(CSRF_COOKIE_NAME.length + 1));
  csrfTokenMemory = token;
  return token;
}
