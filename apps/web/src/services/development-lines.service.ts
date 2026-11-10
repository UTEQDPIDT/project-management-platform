import { api } from '@/lib/axios';

const getDevelopmentLines = async () => {
  const { data } = await api.get('/catalogs/development-lines');
  return data;
};

const getDevelopmentLineSubcategories = async (developmentLineId: string) => {
  const { data } = await api.get('/catalogs/development-line-subcategories', {
    params: { developmentLine: developmentLineId },
  });
  return data;
};

export { getDevelopmentLines, getDevelopmentLineSubcategories };
