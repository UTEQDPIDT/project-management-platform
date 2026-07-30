import { api } from '@/lib/axios';

export type CatalogEndpoint =
  | 'divisions'
  | 'educational-programs'
  | 'product-categories'
  | 'product-subcategories'
  | 'knowledge-areas'
  | 'themed-impact-areas'
  | 'pnd-priorities'
  | 'development-lines'
  | 'sustainability-goals'
  | 'project-programs';

export const createCatalogItem = async ({
  endpoint,
  value,
}: {
  endpoint: CatalogEndpoint;
  value: string;
}) => {
  const { data } = await api.post(`/catalogs/${endpoint}`, { value });
  return data;
};

export const updateCatalogItem = async ({
  endpoint,
  id,
  value,
}: {
  endpoint: CatalogEndpoint;
  id: string;
  value: string;
}) => {
  const { data } = await api.patch(`/catalogs/${endpoint}/${id}`, { value });
  return data;
};

export const deleteCatalogItem = async ({
  endpoint,
  id,
}: {
  endpoint: CatalogEndpoint;
  id: string;
}) => {
  const { data } = await api.delete(`/catalogs/${endpoint}/${id}`);
  return data;
};
