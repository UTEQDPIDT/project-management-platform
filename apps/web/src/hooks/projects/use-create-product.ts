import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createProduct } from '@/services/project.service';

export const useCreateProduct = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: any) => createProduct(projectId, productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
};
