import { useQueryClient, useMutation } from '@tanstack/react-query';
import { deleteProduct } from '@/services/products.service';
import { toast } from 'sonner';

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['products'],
      });
      toast.success('Se elimino el producto');
    },
    onError: () => toast.error('No se elimino el producto'),
  });
};
