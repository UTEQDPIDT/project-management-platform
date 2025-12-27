import { useQueryClient, useMutation } from '@tanstack/react-query';
import { updateProduct } from '@/services/product.service';

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, productData }: { id: string; productData: any }) =>
      updateProduct(id, productData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ['products', 'product', 'project', id],
      });
    },
  });
}
