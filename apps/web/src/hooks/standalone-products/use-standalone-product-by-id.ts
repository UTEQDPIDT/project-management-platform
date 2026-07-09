import { useQuery } from '@tanstack/react-query';
import { getStandaloneProductById } from '@/services/standalone-products.service';

export function useStandaloneProductById(productId?: string) {
  return useQuery({
    queryKey: ['standalone-product', productId],
    queryFn: () => getStandaloneProductById(productId as string),
    enabled: !!productId,
  });
}
