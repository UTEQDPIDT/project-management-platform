import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendJoinRequest } from '@/services/team.service';
import { toast } from 'sonner';

export function useSendJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => sendJoinRequest(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Solicitud enviada');
    },
  });
}
