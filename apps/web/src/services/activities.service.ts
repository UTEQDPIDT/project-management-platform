import { api } from '@/lib/axios';
import { ActivityPayload } from '@repo/types';

const createActivity = async ({
  activityData,
}: {
  activityData: ActivityPayload;
}) => {
  const { data } = await api.post('/activities', activityData);
  return data;
};

const getActivitiesByEntityId = async (entityId: string) => {
  const { data } = await api.get(`/activities/entity/${entityId}`);
  return data;
};

const updateActivity = async ({
  activityId,
  activityData,
}: {
  activityId: string;
  activityData: ActivityPayload;
}) => {
  const { data } = await api.patch(`/activities/${activityId}`, activityData);
  return data;
};

const addAssignee = async ({
  activityId,
  userId,
}: {
  activityId: string;
  userId: string;
}) => {
  await api.patch(`/activities/${activityId}/add-assignee`, { userId });
};

const removeAssignee = async ({
  activityId,
  userId,
}: {
  activityId: string;
  userId: string;
}) => {
  await api.patch(`activities/${activityId}/remove-assignee`, { userId });
};

const deleteActivity = async (activityId: string) => {
  const { data } = await api.delete(`/activities/${activityId}`);
  return data;
};

export {
  createActivity,
  updateActivity,
  addAssignee,
  removeAssignee,
  getActivitiesByEntityId,
  deleteActivity,
};
