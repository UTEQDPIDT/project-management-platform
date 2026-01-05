import { api } from '@/lib/axios';

const getSubcategories = async () => {
  try {
    const { data } = await api.get('/catalogs/product-subcategories');
    return data;
  } catch (err) {
    console.error('Error fetching subcategories', err);
  }
};

export { getSubcategories };
