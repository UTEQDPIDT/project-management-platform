import { api } from '@/lib/axios';
import { UpdateUser } from '@/schemas/update-user.schema';

const getAllUsers = async () => {
  try {
    const { data } = await api.get('/users');
    return data;
  } catch (err) {
    console.log('Error fetching users', err);
  }
};

const updateUser = async (data: UpdateUser) => {
  try {
    console.log('Updating user');
    await api.patch('/users', data);
  } catch (err) {
    console.error('Error when updating user', err);
  }
};

const getUserProfile = async () => {
  try {
    const { data } = await api.get('/users/profile');
    return data;
  } catch (err) {
    console.error('Error when fetching user profile', err);
  }
};

const resolveEmails = async (emails: string[]) => {
  try {
    const { data } = await api.post('/users/resolve-emails', { emails });
    return data;
  } catch (err) {
    console.error('Error resolving user emails', err);
  }
};

export { getAllUsers, updateUser, getUserProfile, resolveEmails };
