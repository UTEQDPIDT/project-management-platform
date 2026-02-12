import { api } from '@/lib/axios';

const getPndPriorities = async () => {
  const { data } = await api.get('/catalogs/pnd-priorities');
  return data;
};

export { getPndPriorities };
