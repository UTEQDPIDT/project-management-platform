import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTeam } from '@/services/teams.service';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

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
    onError: (error) => {
      const axiosError = error as AxiosError<{ message?: string | string[] }>;
      const rawMessage = axiosError.response?.data?.message;
      const message = Array.isArray(rawMessage)
        ? rawMessage[0]
        : rawMessage || 'No se actualizó el equipo';
      toast.error(message);
    },
  });
}
