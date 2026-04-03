const CSRF_COOKIE_NAME = 'financeiro_csrf';

export function getCsrfToken() {
  const cookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CSRF_COOKIE_NAME}=`));

  if (!cookie) {
    return '';
  }

  return decodeURIComponent(cookie.slice(CSRF_COOKIE_NAME.length + 1));
}
