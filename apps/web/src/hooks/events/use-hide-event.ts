import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hideEvent } from '@/services/events.service';
import { toast } from 'sonner';

export function useHideEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hideEvent,
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-events'] });
      toast.success('El evento ha sido ocultado');
    },
    onError: () => toast.error('No se pudo ocultar el evento'),
  });
}
