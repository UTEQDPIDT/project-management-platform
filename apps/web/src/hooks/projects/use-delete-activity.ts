import { useQueryClient, useMutation } from '@tanstack/react-query';
import { deleteActivity } from '@/services/projects.service';
import { toast } from 'sonner';

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteActivity,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['project', variables.projectId],
      });
      toast.success('La actividad ha sido creada');
    },
    onError: () => toast.error('No se ha eliminado la actividad'),
  });
};
