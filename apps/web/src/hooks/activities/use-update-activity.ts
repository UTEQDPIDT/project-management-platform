import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateActivity } from '@/services/activities.service';
import { toast } from 'sonner';

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateActivity,
    onSuccess: (activity: any) => {
      toast.success('Actividad actualizada correctamente');

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
      toast.error('No se pudo actualizar la actividad');
    },
  });
};
