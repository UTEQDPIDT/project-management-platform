import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createProduct } from '@/services/project.service';
import { toast } from 'sonner';

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['project', variables.projectId],
      });
      toast.success('El producto ha sido creado');
    },
    onError: () => toast.error('El producto no ha sido creado'),
  });
};
