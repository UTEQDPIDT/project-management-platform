import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rejectRequest } from '@/services/teams.service';
import { toast } from 'sonner';

export function useRejectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      rejectRequest(teamId, userId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      toast.success('Solicitud rechazada');
    },
    onError: () => toast.error('No se pudo rechazar la solicitud'),
  });
}
