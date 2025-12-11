import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCollaborators } from '@/services/team.service';

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
    },
  });
}
