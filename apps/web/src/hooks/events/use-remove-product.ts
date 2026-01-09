import { useQueryClient, useMutation } from '@tanstack/react-query';
import { removeProduct } from '@/services/events.service';

export const useRemoveProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeProduct,
    onSuccess: (_, variables) => {
      // Invalidate the single event cache and the events list
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};
