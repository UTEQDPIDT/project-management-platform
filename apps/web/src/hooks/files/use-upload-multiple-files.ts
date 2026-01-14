import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadMultipleFiles } from '@/services/files.service';
import { toast } from 'sonner';

export const useUploadMultipleFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadMultipleFiles,
    onSuccess: ({ entityId, entityType }) => {
      toast.success('Archivos subidos correctamente');

      queryClient.invalidateQueries({
        queryKey: ['files', entityId, entityType],
      });
    },
    onError: () => {
      toast.error('No se subieron los archivos');
    },
  });
};
