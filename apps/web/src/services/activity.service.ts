import { api } from '@/lib/axios';
import { IActivity } from '@repo/types';

const createOnBulk = async (activitiesData: Pick<IActivity, 'name'>[]) => {
  try {
    const { data } = await api.post(
      '/activities/create-on-bulk',
      activitiesData,
    );
    return data;
  } catch (err) {
    console.error('Error creating activities on bulk', err);
  }
};

export { createOnBulk };
