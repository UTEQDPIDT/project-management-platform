import { useQuery } from '@tanstack/react-query';
import { getProductById } from '@/services/products.service';

export function useProductById(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => await getProductById(productId),
    enabled: !!productId,
  });
}
