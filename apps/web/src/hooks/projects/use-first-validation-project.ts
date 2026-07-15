import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applyFirstValidation } from '@/services/projects.service';
import { toast } from 'sonner';

export function useFirstValidationProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applyFirstValidation,
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-projects'] });
      toast.success('Se aplicó la primera validación');
    },
    onError: () => toast.error('No se pudo aplicar la primera validación'),
  });
}