import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendJoinRequest } from '@/services/team.service';

export function useSendJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => sendJoinRequest(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}
