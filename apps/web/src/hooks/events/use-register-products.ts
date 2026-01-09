import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerProducts } from '@/services/events.service';

export function useRegisterProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      products: products,
    }: {
      eventId: string;
      products: any;
    }) => registerProducts({ eventId, products }),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
