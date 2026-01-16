import { useQuery } from '@tanstack/react-query';
import { getFilesForEntity } from '@/services/files.service';

export function useFilesForEntity(entityId: string) {
  return useQuery({
    queryFn: () => getFilesForEntity(entityId),
    queryKey: ['files', entityId],
  });
}
