import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTeam } from '@/services/teams.service';
import { toast } from 'sonner';

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('El equipo ha sido creado');
    },
    onError: () => {
      toast.error('No se creo el equipo');
    },
  });
}
