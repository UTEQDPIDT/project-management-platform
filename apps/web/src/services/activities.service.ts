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

const addAssignee = async ({
  activityId,
  userId,
}: {
  activityId: string;
  userId: string;
}) => {
  try {
    await api.patch(`/activities/${activityId}/add-assignee`, { userId });
  } catch (err) {
    console.error('Error assigning user to activity');
  }
};

const removeAssignee = async ({
  activityId,
  userId,
}: {
  activityId: string;
  userId: string;
}) => {
  try {
    await api.patch(`activities/${activityId}/remove-assignee`, { userId });
  } catch (err) {
    console.error('Error removing assignee');
  }
};

export { updateActivity, addAssignee, removeAssignee };
