import { useQuery } from '@tanstack/react-query';
import { getUserById } from '@/services/users.service';

export function useUserById(userId?: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: ({ queryKey }) => {
      const id = queryKey[1] as string | undefined;
      if (!id) return Promise.reject(new Error('No userId provided'));
      return getUserById(id);
    },
    enabled: Boolean(userId),
  });
}
