import { useQueryClient, useMutation } from '@tanstack/react-query';
import { deleteProduct } from '@/services/project.service';

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['project', variables.projectId],
      });
    },
  });
};
