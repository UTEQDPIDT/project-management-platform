import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createActivity } from '@/services/activities.service';
import { toast } from 'sonner';

export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createActivity,
    onSuccess: (activity: any) => {
      toast.success('Actividad creada correctamente');

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
      toast.error('No se pudo crear la actividad');
    },
  });
};
