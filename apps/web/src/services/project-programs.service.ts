import {api} from '@/lib/axios';

const getProjectPrograms = async () => {
  const { data } = await api.get('/catalogs/project-programs');
  return data;
};

export { getProjectPrograms };