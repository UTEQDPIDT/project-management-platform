import { api } from '@/lib/axios';

const getSustainableGoals = async () => {
  try {
    const { data } = await api.get('/catalogs/sustainability-goals');
    return data;
  } catch (err) {
    console.error('Error fetching getSustainability Goals', err);
  }
};

export { getSustainableGoals };
