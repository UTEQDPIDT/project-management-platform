import { useQuery } from '@tanstack/react-query';
import { getStandaloneProductsByUser } from '@/services/standalone-products.service';

export function useStandaloneProductsByUser(userId?: string, enabled = true) {
  return useQuery({
    queryKey: ['standalone-products', userId],
    queryFn: () => getStandaloneProductsByUser(userId as string),
    enabled: enabled && !!userId,
  });
}
