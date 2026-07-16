import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTeam } from '@/services/teams.service';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('El equipo ha sido creado');
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ message?: string | string[] }>;
      const rawMessage = axiosError.response?.data?.message;
      const message = Array.isArray(rawMessage)
        ? rawMessage[0]
        : rawMessage || 'No se creo el equipo';

      toast.error(message);
    },
  });
}
