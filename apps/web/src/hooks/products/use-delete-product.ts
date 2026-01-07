import { useQueryClient, useMutation } from '@tanstack/react-query';
import { deleteProduct } from '@/services/product.service';
import { toast } from 'sonner';

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'product'] });
      toast.success('Se ha eliminado el producto');
    },
    onError: () => toast.error('No se ha eliminado el producto'),
  });
}
