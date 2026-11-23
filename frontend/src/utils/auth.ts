// Utility untuk mengatur token auth
export const setTestToken = () => {
  localStorage.setItem('auth_token', 'test-token-123');
  console.log('✅ Test token set in localStorage');
};

export const getToken = () => {
  return localStorage.getItem('auth_token');
};

export const hasToken = () => {
  return !!localStorage.getItem('auth_token');
};
