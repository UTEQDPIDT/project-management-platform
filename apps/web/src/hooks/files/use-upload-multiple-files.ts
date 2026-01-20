import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadMultipleFiles } from '@/services/files.service';
import { toast } from 'sonner';

export const useUploadMultipleFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadMultipleFiles,
    onSuccess: ({ entityId }) => {
      toast.success('Archivos subidos correctamente');

      queryClient.invalidateQueries({
        queryKey: ['files', entityId],
      });

      // Invalidate product queries to refresh product data
      queryClient.invalidateQueries({
        queryKey: ['product', entityId],
      });
      queryClient.invalidateQueries({
        queryKey: ['project-products'],
      });
      queryClient.invalidateQueries({
        queryKey: ['products'],
      });
    },
    onError: () => {
      toast.error('No se subieron los archivos');
    },
  });
};
