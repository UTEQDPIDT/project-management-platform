import { useQueryClient, useMutation } from '@tanstack/react-query';
import { updateProduct } from '@/services/products.service';
import { toast } from 'sonner';

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['products'],
      });
      toast.success('Se ha actualizado el producto');
    },
    onError: () => {
      toast.error('No se ha actualizado el producto');
    },
  });
}
