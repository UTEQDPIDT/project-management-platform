import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCollaborators } from '@/services/team.service';
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
      toast.success('El colaborador ha sido agregado');
    },
  });
}
