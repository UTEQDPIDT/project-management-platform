import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTeam } from '@/services/teams.service';

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}
