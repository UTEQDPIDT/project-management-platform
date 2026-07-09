import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStandaloneProduct } from '@/services/standalone-products.service';
import { toast } from 'sonner';

export function useCreateStandaloneProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStandaloneProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['standalone-products'] });
      queryClient.invalidateQueries({ queryKey: ['standalone-product'] });
      toast.success('El producto independiente ha sido creado');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message;

      if (Array.isArray(message) && message.length > 0) {
        toast.error(String(message[0]));
        return;
      }

      if (typeof message === 'string' && message.length > 0) {
        toast.error(message);
        return;
      }

      toast.error('El producto independiente no ha sido creado');
    },
  });
}
