import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeCollaborator } from '@/services/teams.service';
import { toast } from 'sonner';

export function useRemoveCollaborator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      removeCollaborator(teamId, userId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      toast.success('Colaborador expulsado del equipo');
    },
    onError: () => toast.error('No se expulsó al colaborador'),
  });
}
