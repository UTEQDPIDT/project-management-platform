import { useQueryClient, useMutation } from '@tanstack/react-query';
import { updateProduct } from '@/services/products.service';
import { toast } from 'sonner';
import axios from 'axios';

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: ({ id }) => {
      // Invalidate all product-related queries
      queryClient.invalidateQueries({
        queryKey: ['products'],
      });
      queryClient.invalidateQueries({
        queryKey: ['project-products'],
      });
      queryClient.invalidateQueries({
        queryKey: ['product'],
      });

      // Invalidate file queries for this product
      queryClient.invalidateQueries({
        queryKey: ['files', id],
      });

      toast.success('Se ha actualizado el producto');
    },
    onError: (error) => {
      const message = axios.isAxiosError<{ message?: string }>(error) && error.response?.status === 409
        ? error.response.data?.message
        : undefined;
      toast.error('No se ha actualizado el producto', { description: message });
    },
  });
}
