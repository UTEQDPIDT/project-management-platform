import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addMembers } from '@/services/team.service';
import { toast } from 'sonner';

export function useAddMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, members }: { teamId: string; members: string[] }) =>
      addMembers(teamId, members),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      toast.success('El miembro ha sido agregado');
    },
    onError: () => {
      toast.error('El miembro no ha sido agregado');
    },
  });
}
