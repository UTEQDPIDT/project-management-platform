import { api } from '@/lib/axios';
import { UpdateUser } from '@/schemas/update-user.schema';
import { toast } from 'sonner';

const getAllUsers = async () => {
  try {
    const { data } = await api.get('/users');
    return data;
  } catch (err) {
    console.log('Error fetching users', err);
  }
};

const getUserById = async (userId: string) => {
  try {
    const { data } = await api.get(`/users/${userId}`);
    return data;
  } catch (err) {
    console.error('Error fetching user');
    toast.error('No se encontró el perfil');
  }
};

const updateUser = async ({
  userId,
  data,
}: {
  userId: string;
  data: UpdateUser;
}) => {
  try {
    const { status } = await api.patch(`/users/${userId}`, data);
    if (status === 200) {
      toast.success('Perfil actualizado');
    }
  } catch (err) {
    console.error('Error when updating user', err);
    toast.error('No se actualizó el perfil');
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

export { getAllUsers, getUserById, updateUser, getUserProfile, resolveEmails };
