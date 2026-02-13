import { api } from '@/lib/axios';

const getEducationalPrograms = async () => {
  const { data } = await api.get('/catalogs/educational-programs');
  return data;
};

export { getEducationalPrograms };
