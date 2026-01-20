import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCollaborators } from '@/services/teams.service';
import { toast } from 'sonner';

export function useAddCollaborators() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teamId,
      collaborators,
    }: {
      teamId: string;
      collaborators: string[];
    }) => addCollaborators(teamId, collaborators),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      toast.success('Colaboradores agregados');
    },
    onError: () => toast.error('No se agregaron los colaboradores'),
  });
}
