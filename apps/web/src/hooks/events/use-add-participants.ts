import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addParticipants } from '@/services/events.service';
import { toast } from 'sonner';

export function useAddParticipants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, userIds }: { eventId: string; userIds: any }) =>
      addParticipants({ eventId, userIds }),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Se han agregado participantes');
    },
    onError: () => toast.error('No se han agregado los participantes'),
  });
}
