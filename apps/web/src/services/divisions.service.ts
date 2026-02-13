import { api } from '@/lib/axios';

const getDivisions = async () => {
  const { data } = await api.get('/catalogs/divisions');
  return data;
};

export { getDivisions };
