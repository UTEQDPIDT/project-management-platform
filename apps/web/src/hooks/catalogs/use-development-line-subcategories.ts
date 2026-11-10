import { useQuery } from '@tanstack/react-query';
import { getDevelopmentLineSubcategories } from '@/services/development-lines.service';

export function useDevelopmentLineSubcategories(developmentLineId?: string) {
  return useQuery({
    queryKey: ['development-line-subcategories', developmentLineId],
    queryFn: () => getDevelopmentLineSubcategories(developmentLineId as string),
    enabled: !!developmentLineId,
  });
}
