import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateStandaloneProduct } from '@/services/standalone-products.service';
import { toast } from 'sonner';

export function useUpdateStandaloneProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStandaloneProduct,
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ['standalone-products'] });
      queryClient.invalidateQueries({ queryKey: ['standalone-product'] });
      queryClient.invalidateQueries({ queryKey: ['files', id] });
      toast.success('Se ha actualizado el producto independiente');
    },
    onError: () => toast.error('No se ha actualizado el producto independiente'),
  });
}
