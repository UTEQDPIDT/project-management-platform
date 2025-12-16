import { api } from '@/lib/axios';

const getThemedImpactAreas = async () => {
  try {
    const { data } = await api.get('/catalogs/themed-impact-areas');
    return data;
  } catch (err) {
    console.error('Error fetching impact areas', err);
  }
};

export { getThemedImpactAreas };
