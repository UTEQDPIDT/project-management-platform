import { api } from '../axios';

export const logout = async () => {
  try {
    await api.post('/auth/logout');
    window.location.href = '/';
  } catch (err) {
    console.error('Logout failed:', err);
    window.location.href = '/';
  }
};
