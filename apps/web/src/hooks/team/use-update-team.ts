import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTeam } from '@/services/team.service';
import { toast } from 'sonner';

export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, teamData }: { teamId: string; teamData: any }) =>
      updateTeam(teamId, teamData),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('El equipo ha sido actualizado');
    },
    onError: () => {
      toast.error('El equipo no pudo ser actualizado');
    },
  });
}
