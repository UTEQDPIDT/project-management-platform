import { useQueryClient, useMutation } from '@tanstack/react-query';
import { removeProduct } from '@/services/events.service';
import { toast } from 'sonner';

export const useRemoveProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeProduct,
    onSuccess: (_, variables) => {
      // Invalidate the single event cache and the events list
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Se ha retirado el producto');
    },
    onError: () => toast.error('No se ha retirado el producto'),
  });
};
