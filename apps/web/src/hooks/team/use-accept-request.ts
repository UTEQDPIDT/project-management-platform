import { useMutation, useQueryClient } from '@tanstack/react-query';
import { acceptRequest } from '@/services/team.service';
import { toast } from 'sonner';

export function useAcceptRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      acceptRequest(teamId, userId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      toast.success('Solicitud aceptada');
    },
  });
}
