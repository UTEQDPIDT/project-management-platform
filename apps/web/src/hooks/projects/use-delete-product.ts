import { useQueryClient, useMutation } from '@tanstack/react-query';
import { deleteProduct } from '@/services/project.service';

export const useDeleteProduct = (projectId: string, productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteProduct(projectId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
};
