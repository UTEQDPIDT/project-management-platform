import { useQuery } from '@tanstack/react-query';
import { getProductsByProject } from '@/services/products.service';

export function useProductsByProject(projectId?: string) {
  return useQuery({
    queryKey: ['project-products', projectId],
    queryFn: () => getProductsByProject(projectId as string),
    enabled: Boolean(projectId),
  });
}
