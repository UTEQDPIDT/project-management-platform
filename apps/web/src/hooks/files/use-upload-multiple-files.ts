import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadMultipleFiles } from '@/services/files.service';
import { toast } from 'sonner';
import { EntityType, FilePurpose, UploadMultipleFilesResponse } from '@repo/types';

// Definimos la estructura exacta que el componente le envía a la mutación
interface UploadMutationVariables {
  files: File[];
  entityId: string;
  entityType: EntityType;
  purpose: FilePurpose;
}

export const useUploadMultipleFiles = () => {
  const queryClient = useQueryClient();

  // Pasamos los tipos genéricos: <TipoRespuesta, TipoError, TipoVariables>
  return useMutation<UploadMultipleFilesResponse, Error, UploadMutationVariables>({
    mutationFn: uploadMultipleFiles,
    onSuccess: (_data, variables) => {
      toast.success('Archivos subidos correctamente');

      // Ahora TypeScript sabe con 100% de certeza que variables tiene "entityId"
      queryClient.invalidateQueries({
        queryKey: ['files', variables.entityId],
      });

      // Invalidate product queries to refresh product data
      queryClient.invalidateQueries({
        queryKey: ['product', variables.entityId],
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