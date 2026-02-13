import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteActivity } from '@/services/activities.service';
import { toast } from 'sonner';
import { IActivity } from '@repo/types';

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteActivity,
    onSuccess: (activity: IActivity) => {
      toast.success('Actividad eliminada correctamente');

      // Invalidate activities queries with the entity ID
      queryClient.invalidateQueries({
        queryKey: ['activities', activity.entityId],
      });

      // Also invalidate the general activities list
      queryClient.invalidateQueries({
        queryKey: ['activities'],
      });
    },
    onError: () => {
      toast.error('No se pudo eliminar la actividad');
    },
  });
};
