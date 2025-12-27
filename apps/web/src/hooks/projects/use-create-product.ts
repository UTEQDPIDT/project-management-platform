import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createProduct } from '@/services/project.service';

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['project', variables.projectId],
      });
    },
  });
};
