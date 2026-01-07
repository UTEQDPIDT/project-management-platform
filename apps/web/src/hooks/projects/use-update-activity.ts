import { useQueryClient, useMutation } from '@tanstack/react-query';
import { updateActivity } from '@/services/activity.service';
import { toast } from 'sonner';

export function useUpdateProjectActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project'],
      });
      toast.success('Se actualizó la actividad');
    },
    onError: () => toast.error('No se actualizó la actividad'),
  });
}
