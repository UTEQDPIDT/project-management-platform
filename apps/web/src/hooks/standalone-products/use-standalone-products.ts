import { useQuery } from '@tanstack/react-query';
import { getStandaloneProducts } from '@/services/standalone-products.service';

export function useStandaloneProducts(enabled = true) {
  return useQuery({
    queryKey: ['standalone-products'],
    queryFn: getStandaloneProducts,
    enabled,
  });
}
