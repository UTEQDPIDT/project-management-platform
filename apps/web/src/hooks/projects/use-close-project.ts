import { useMutation, useQueryClient } from '@tanstack/react-query';
import { closeProject } from '@/services/projects.service';
import { toast } from 'sonner';

export function useCloseProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: closeProject,
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-projects'] });
      toast.success('El proyecto ha sido cerrado');
    },
    onError: () => toast.error('No se pudo cerrar el proyecto'),
  });
}