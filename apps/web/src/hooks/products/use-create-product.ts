import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createProduct } from '@/services/product.service';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'product'] });
    },
  });
}
