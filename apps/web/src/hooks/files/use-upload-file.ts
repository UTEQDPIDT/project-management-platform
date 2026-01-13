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
    },
    onError: () => {
      toast.error('No se pudo subir el archivo');
    },
  });
};
