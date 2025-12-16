import { api } from '@/lib/axios';

const getPndPriorities = async () => {
  try {
    const { data } = await api.get('/catalogs/pnd-priorities');
    return data;
  } catch (err) {
    console.error('Error fetching PND priorities', err);
  }
};

export { getPndPriorities };
