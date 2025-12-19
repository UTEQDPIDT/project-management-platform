import { api } from '@/lib/axios';

const getCategories = async () => {
  try {
    const { data } = await api.get('/catalogs/product-categories');
    return data;
  } catch (err) {
    console.error('Error fetching categories', err);
  }
};

export { getCategories };
