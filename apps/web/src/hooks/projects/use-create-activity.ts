import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createActivity } from '@/services/project.service';
import { toast } from 'sonner';

export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createActivity,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['project', variables.projectId],
      });
      toast.success('La actividad ha sido creada');
    },
    onError: () => toast.error('No se ha creado la actividad'),
  });
};
