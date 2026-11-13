import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFile } from '@/services/files.service';
import { IFile, UploadFilePayload } from '@repo/types';
import { toast } from 'sonner';
import axios from 'axios';

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadFilePayload) => uploadFile(payload),
    onSuccess: (file: IFile) => {
      toast.success('Archivo subido correctamente');

      queryClient.invalidateQueries({
        queryKey: ['files', file.entityId],
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
    onError: (error) => {
      const message = axios.isAxiosError<{ message?: string }>(error) && error.response?.status === 409
        ? error.response.data?.message
        : undefined;
      toast.error('No se pudo subir el archivo', { description: message });
    },
  });
};
