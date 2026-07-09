import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteStandaloneProduct } from '@/services/standalone-products.service';
import { toast } from 'sonner';

export function useDeleteStandaloneProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStandaloneProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['standalone-products'] });
      queryClient.invalidateQueries({ queryKey: ['standalone-product'] });
      toast.success('Se elimino el producto independiente');
    },
    onError: () => toast.error('No se elimino el producto independiente'),
  });
}
