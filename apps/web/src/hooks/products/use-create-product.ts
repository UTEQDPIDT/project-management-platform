import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createProduct } from '@/services/product.service';
import { toast } from 'sonner';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'product'] });
      toast.success('Se ha creado el producto');
    },
    onError: () => {
      toast.error('No se ha creado el producto');
    },
  });
}
