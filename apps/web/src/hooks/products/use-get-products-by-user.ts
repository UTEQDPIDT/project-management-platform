import { useQuery } from '@tanstack/react-query';
import { getProductsByUser } from '@/services/product.service';

export function useProductsByUser(userId?: string) {
  return useQuery({
    queryKey: ['products', userId],
    queryFn: () => getProductsByUser(userId as string),
    enabled: Boolean(userId),
  });
}
