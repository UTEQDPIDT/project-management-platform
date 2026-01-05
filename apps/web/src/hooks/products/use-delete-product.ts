import { useQueryClient, useMutation } from '@tanstack/react-query';
import { deleteProduct } from '@/services/product.service';

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'product'] });
    },
  });
}
