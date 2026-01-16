import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFile } from '@/services/files.service';
import { IFile, UploadFilePayload } from '@repo/types';
import { toast } from 'sonner';

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadFilePayload) => uploadFile(payload),
    onSuccess: (file: IFile) => {
      toast.success('Archivo subido correctamente');

      queryClient.invalidateQueries({
        queryKey: ['files', file.entityId, file.entityType],
      });

      // Invalidate product queries to refresh product data
      queryClient.invalidateQueries({
        queryKey: ['product', file.entityId],
      });
      queryClient.invalidateQueries({
        queryKey: ['project-products'],
      });
      queryClient.invalidateQueries({
        queryKey: ['products'],
      });
    },
    onError: () => {
      toast.error('No se pudo subir el archivo');
    },
  });
};
