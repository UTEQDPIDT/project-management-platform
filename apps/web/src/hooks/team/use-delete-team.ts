import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTeam } from '@/services/teams.service';
import { toast } from 'sonner';

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('El equipo ha sido eliminado');
    },
    onError: () => {
      toast.error('El equipo no ha sido eliminado');
    },
  });
}
