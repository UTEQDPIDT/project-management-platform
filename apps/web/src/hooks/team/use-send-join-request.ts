import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendJoinRequest } from '@/services/team.service';

export function useSendJoinRequest() {
  return useMutation({
    mutationFn: (teamId: string) => sendJoinRequest(teamId),
  });
}
