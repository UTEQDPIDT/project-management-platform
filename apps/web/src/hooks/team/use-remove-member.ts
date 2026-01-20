import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeMember } from '@/services/teams.service';
import { toast } from 'sonner';

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      removeMember(teamId, userId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      toast.success('Miembro expulsado del equipo');
    },
    onError: () => toast.error('No se expulsó al miembro'),
  });
}
