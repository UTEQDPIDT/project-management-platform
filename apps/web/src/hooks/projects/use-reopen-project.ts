import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reopenProject } from '@/services/projects.service';
import { toast } from 'sonner';

export function useReopenProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reopenProject,
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-projects'] });
      toast.success('El proyecto ha sido reabierto');
    },
    onError: () => toast.error('No se pudo reabrir el proyecto'),
  });
}