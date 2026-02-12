import { api } from '@/lib/axios';

const getKnowledgeAreas = async () => {
  const { data } = await api.get('/catalogs/knowledge-areas');
  return data;
};

export { getKnowledgeAreas };
