import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rejectRequest } from '@/services/team.service';

export function useRejectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      rejectRequest(teamId, userId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
    },
  });
}
