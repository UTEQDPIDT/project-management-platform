import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeMember } from '@/services/teams.service';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      removeMember(teamId, userId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      toast.success('Miembro expulsado del equipo');
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ message?: string | string[] }>;
      const rawMessage = axiosError.response?.data?.message;
      const message = Array.isArray(rawMessage)
        ? rawMessage[0]
        : rawMessage || 'No se expulsó al miembro';
      toast.error(message);
    },
  });
}
