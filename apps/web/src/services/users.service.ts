import { api } from '@/lib/axios';
import { UpdateUser } from '@/schemas/update-user.schema';
import { toast } from 'sonner';

const getAllUsers = async () => {
  const { data } = await api.get('/users');
  return data;
};

const getUserById = async (userId: string) => {
  const { data } = await api.get(`/users/${userId}`);
  return data;
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
  const { data } = await api.get('/users/profile');
  return data;
};

const resolveEmails = async (emails: string[]) => {
  const { data } = await api.post('/users/resolve-emails', { emails });
  return data;
};

export { getAllUsers, getUserById, updateUser, getUserProfile, resolveEmails };
