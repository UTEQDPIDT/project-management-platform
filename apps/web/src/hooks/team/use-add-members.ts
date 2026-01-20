import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addMembers } from '@/services/teams.service';
import { toast } from 'sonner';

export function useAddMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, members }: { teamId: string; members: string[] }) =>
      addMembers(teamId, members),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      toast.success('Miembros agregados');
    },
    onError: () => {
      toast.error('No se agregaron los miembros');
    },
  });
}
