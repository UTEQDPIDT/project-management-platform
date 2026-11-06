import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateActivity } from '@/services/activities.service';
import { EntityType, IActivity } from '@repo/types';
import axios from 'axios';
import { toast } from 'sonner';

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateActivity,
    onSuccess: (activity: IActivity) => {
      toast.success('Actividad actualizada correctamente');

      // Invalidate activities queries with the entity ID
      queryClient.invalidateQueries({
        queryKey: ['activities', activity.entityId],
      });

      // Also invalidate the general activities list
      queryClient.invalidateQueries({
        queryKey: ['activities'],
      });
      if (activity.entityType === EntityType.PROJECT) {
        queryClient.invalidateQueries({
          queryKey: ['project', activity.entityId],
        });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      }
    },
    onError: (error) => {
      const code = axios.isAxiosError<{ code?: string }>(error)
        ? error.response?.data?.code
        : undefined;

      if (code === 'ACTIVITY_EVIDENCE_REQUIRED') {
        toast.error(
          'Debes adjuntar al menos una evidencia antes de completar la actividad.',
        );
        return;
      }

      toast.error('No se pudo actualizar la actividad');
    },
  });
};
