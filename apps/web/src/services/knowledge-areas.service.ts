import { api } from '@/lib/axios';

const getKnowledgeAreas = async () => {
  try {
    const { data } = await api.get('/catalogs/knowledge-areas');
    return data;
  } catch (err) {
    console.error('Error fetching knowledge areas', err);
  }
};

export { getKnowledgeAreas };
