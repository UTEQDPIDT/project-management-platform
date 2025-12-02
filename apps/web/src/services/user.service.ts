import { api } from '@/lib/axios';
import { UpdateUser } from '@/schemas/update-user.schema';

const updateUser = async (data: UpdateUser) => {
  try {
    console.log('Updating user');
    await api.patch('/users', data);
  } catch (err) {
    console.error('Error when updating user', err);
  }
};

export { updateUser };
