import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProject } from '@/services/project.service';
import { toast } from 'sonner';

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('El proyecto ha sido eliminado');
    },
    onError: () => toast.error('El proyecto no ha sido eliminado'),
  });
}
