import { useQueryClient, useMutation } from '@tanstack/react-query';
import { deleteProduct } from '@/services/project.service';
import { toast } from 'sonner';

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['project', variables.projectId],
      });
      toast.success('El producto ha sido eliminado');
    },
    onError: () => toast.error('El producto no ha sido elimnado'),
  });
};
