import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerProducts, updateEvent } from '@/services/events.service';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
      toast.success('Se agregaron los productos');
    },
    onError: () => {
      toast.error('No se agregaron los productos');
    },
  });
}
