import { api } from '@/lib/axios';

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

export { updateActivity };
