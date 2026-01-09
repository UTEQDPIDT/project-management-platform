import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addMembers } from '@/services/teams.service';

export function useAddMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, members }: { teamId: string; members: string[] }) =>
      addMembers(teamId, members),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
    },
  });
}
