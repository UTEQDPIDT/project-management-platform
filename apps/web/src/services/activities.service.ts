import { api } from '@/lib/axios';
import { toast } from 'sonner';

const updateActivity = async ({
  activityId,
  activityData,
}: {
  activityId: string;
  activityData: any;
}) => {
  try {
    const { status } = await api.patch(
      `/activities/${activityId}`,
      activityData,
    );
    if (status === 200) {
      toast.success('Se actualizó la actividad');
    }
  } catch (err) {
    console.error('Error updating activity', err);
    toast.success('No se actualizó la actividad');
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
