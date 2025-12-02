import { api } from '@/lib/axios';

const getEducationalPrograms = async () => {
  try {
    const { data } = await api.get('/catalogs/educational-programs');
    return data;
  } catch (err) {
    console.error('Error fetching educational programs', err);
  }
};

export { getEducationalPrograms };
