import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hideProject } from '@/services/projects.service';
import { toast } from 'sonner';

export function useHideProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hideProject,
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-projects'] });
      toast.success('El proyecto ha sido ocultado');
    },
    onError: () => toast.error('No se pudo ocultar el proyecto'),
  });
}
