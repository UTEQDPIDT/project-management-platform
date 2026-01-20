import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createProduct } from '@/services/products.service';
import { toast } from 'sonner';

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
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
      toast.success('El producto ha sido creado');
    },
    onError: () => toast.error('El producto no ha sido creado'),
  });
};
