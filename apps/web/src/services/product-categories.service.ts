import { api } from '@/lib/axios';

const getCategories = async () => {
  const { data } = await api.get('/catalogs/product-categories');
  return data;
};

export { getCategories };
