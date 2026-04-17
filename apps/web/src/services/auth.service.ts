import { api } from '@/lib/axios';

export const forgotPassword = async (email: string) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (payload: {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const { data } = await api.post('/auth/reset-password', payload);
  return data;
};
