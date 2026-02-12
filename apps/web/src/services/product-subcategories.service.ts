import { api } from '@/lib/axios';

const getSubcategories = async () => {
  const { data } = await api.get('/catalogs/product-subcategories');
  return data;
};

export { getSubcategories };
