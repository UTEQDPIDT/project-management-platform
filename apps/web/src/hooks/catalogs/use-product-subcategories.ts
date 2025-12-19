import { useQuery } from '@tanstack/react-query';
import { getSubcategories } from '@/services/product-subcategories.service';

export function useProductSubcategories() {
  return useQuery({
    queryFn: getSubcategories,
    queryKey: ['product-subcategories'],
  });
}
