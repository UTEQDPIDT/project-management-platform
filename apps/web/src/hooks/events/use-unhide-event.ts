import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unhideEvent } from '@/services/events.service';
import { toast } from 'sonner';

export function useUnhideEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unhideEvent,
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-events'] });
      toast.success('El evento ha sido mostrado nuevamente');
    },
    onError: () => toast.error('No se pudo mostrar el evento'),
  });
}
