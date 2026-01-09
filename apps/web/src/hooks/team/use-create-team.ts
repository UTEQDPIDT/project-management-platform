import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTeam } from '@/services/teams.service';

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}
