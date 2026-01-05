import { api } from '@/lib/axios';

const getDevelopmentLines = async () => {
  try {
    const { data } = await api.get('/catalogs/development-lines');
    return data;
  } catch (err) {
    console.error('Error fetching Development Lines', err);
  }
};

export { getDevelopmentLines };
