import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProject } from '@/services/projects.service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { userProfile } from 'context/profile-provider';
import { IProject, UserRole } from '@repo/types';

export function useCreateProject() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = userProfile();
  const rootUrl = user.role === UserRole.ADMIN ? '/admin' : '/user';

  return useMutation({
    mutationFn: createProject,
    onSuccess: (project: IProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('El proyecto ha sido creado');
      if (project) {
        router.push(`${rootUrl}/proyectos/${project._id}`);
      } else {
        router.push(`${rootUrl}/proyectos`);
      }
    },
    onError: () => toast.error('No se creo el proyecto'),
  });
}
