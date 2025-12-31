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

const updateActivity = async ({
  activityId,
  activityData,
}: {
  activityId: string;
  activityData: any;
}) => {
  try {
    const { data } = await api.patch(`/activities/${activityId}`, activityData);
    return data;
  } catch (err) {
    console.error('Error updating activity', err);
  }
};

export { createOnBulk, updateActivity };
