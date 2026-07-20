import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelFirstValidation } from '@/services/projects.service';
import { toast } from 'sonner';

export function useCancelFirstValidationProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelFirstValidation,
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-projects'] });
      toast.success('Se canceló la primera validación');
    },
    onError: () => toast.error('No se pudo cancelar la primera validación'),
  });
}
