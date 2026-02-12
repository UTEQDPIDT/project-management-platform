import { api } from '@/lib/axios';

const getDevelopmentLines = async () => {
  const { data } = await api.get('/catalogs/development-lines');
  return data;
};

export { getDevelopmentLines };
