import { api } from '@/lib/axios';

const getDivisions = async () => {
  try {
    const { data } = await api.get('/divisions');
    return data;
  } catch (err) {
    console.error('Error fetching divisions', err);
  }
};

export { getDivisions };
