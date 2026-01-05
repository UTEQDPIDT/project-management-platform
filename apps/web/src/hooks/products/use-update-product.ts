import { useQueryClient, useMutation } from '@tanstack/react-query';
import { updateProduct } from '@/services/product.service';

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project'],
      });
    },
  });
}
