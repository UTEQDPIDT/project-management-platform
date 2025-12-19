import { useQuery } from '@tanstack/react-query';
import { getProductById } from '@/services/product.service';

export function useTeam(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => await getProductById(productId),
    enabled: !!productId,
  });
}
