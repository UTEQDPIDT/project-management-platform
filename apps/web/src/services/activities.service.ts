import { api } from '@/lib/axios';

const createActivity = async ({ activityData }: { activityData: any }) => {
  try {
    const { data } = await api.post('/activities', activityData);
    return data;
  } catch (error) {
    throw error;
  }
};

const getActivitiesByEntityId = async (entityId: string) => {
  try {
    const { data } = await api.get(`/activities/entity/${entityId}`);
    return data;
  } catch (error) {
    throw error;
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
    throw err;
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

const deleteActivity = async (activityId: string) => {
  try {
    const { data } = await api.delete(`/activities/${activityId}`);
    return data;
  } catch (err) {
    console.error('Error deleting activity', err);
    throw err;
  }
};

export {
  createActivity,
  updateActivity,
  addAssignee,
  removeAssignee,
  getActivitiesByEntityId,
  deleteActivity,
};
