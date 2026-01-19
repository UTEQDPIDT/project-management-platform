import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEvent } from '@/services/events.service';
import { toast } from 'sonner';

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('El evento ha sido creado');
    },
    onError: () => toast.error('No se ha creado el evento'),
  });
}
