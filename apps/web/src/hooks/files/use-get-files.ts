import { useQuery } from '@tanstack/react-query';
import { getAllFiles } from '@/services/files.service';

export function useGetFiles() {
  return useQuery({
    queryFn: getAllFiles,
    queryKey: ['files'],
  });
}
