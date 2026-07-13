import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProject } from '@/services/projects.service';
import { toast } from 'sonner';
import { IProject } from '@repo/types';

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: (project: IProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('El proyecto ha sido creado');
    },
    onError: () => toast.error('No se creo el proyecto'),
  });
}
