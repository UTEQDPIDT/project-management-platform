import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerParticipant } from '@/services/events.service';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export function useRegisterParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerParticipant,
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Se ha registrado al evento');
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ message?: string }>;
      if (axiosError.response?.data?.message?.includes('The event is closed')) {
        toast.error('El evento está cerrado y no acepta nuevos organizadores.');
      } else {
        toast.error('No se pudo registrar al evento');
      }
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
