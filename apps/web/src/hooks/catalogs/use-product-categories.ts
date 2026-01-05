import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/services/product-categories.service';

export function useProductCategories() {
  return useQuery({
    queryFn: getCategories,
    queryKey: ['product-categories'],
  });
}
