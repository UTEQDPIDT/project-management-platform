import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProject } from '@/services/project.service';
import { toast } from 'sonner';

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('El proyecto ha sido creado');
    },
    onError: () => toast.error('El proyecto no ha sido creado'),
  });
}
