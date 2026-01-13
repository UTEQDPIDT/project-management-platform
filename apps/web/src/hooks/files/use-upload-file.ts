import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFile } from '@/services/files.service';
import { IFile, UploadFilePayload } from '@repo/types';

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadFilePayload) => uploadFile(payload),
    onSuccess: (file: IFile) => {
      queryClient.invalidateQueries({
        queryKey: ['files', file.entityId],
      });
    },
  });
};
