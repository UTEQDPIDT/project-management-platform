import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteFile } from '@/services/files.service';
import { IFile } from '@repo/types';
import { toast } from 'sonner';

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFile,
    onSuccess: (file: IFile) => {
      toast.success('El archivo fue eliminado');

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
    onError: () => {
      toast.error('No se pudo eliminar el archivo');
    },
  });
};
