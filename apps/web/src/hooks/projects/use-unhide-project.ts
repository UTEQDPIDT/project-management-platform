import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unhideProject } from '@/services/projects.service';
import { toast } from 'sonner';

export function useUnhideProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unhideProject,
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-projects'] });
      toast.success('El proyecto ha sido mostrado nuevamente');
    },
    onError: () => toast.error('No se pudo mostrar el proyecto'),
  });
}
