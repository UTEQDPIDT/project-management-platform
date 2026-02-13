import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProject } from '@/services/projects.service';
import { toast } from 'sonner';
import { IProject } from '@repo/types';

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      projectData,
    }: {
      projectId: string;
      projectData: IProject;
    }) => updateProject(projectId, projectData),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('El proyecto ha sido actualizado');
    },
    onError: () => toast.error('No se actualizó el proyecto'),
  });
}
