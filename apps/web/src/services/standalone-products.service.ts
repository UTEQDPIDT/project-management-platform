import { api } from '@/lib/axios';

const createStandaloneProduct = async ({
  productData,
}: {
  productData: FormData;
}) => {
  const { data } = await api.post('/standalone-products', productData);
  return data;
};

const getStandaloneProducts = async () => {
  const { data } = await api.get('/standalone-products');
  return data;
};

const getStandaloneProductById = async (id: string) => {
  const { data } = await api.get(`/standalone-products/${id}`);
  return data;
};

const getStandaloneProductsByUser = async (userId: string) => {
  const { data } = await api.get(`/standalone-products/by-user/${userId}`);
  return data;
};

const updateStandaloneProduct = async ({
  productId,
  productData,
}: {
  productId: string;
  productData: FormData;
}) => {
  const { data } = await api.patch(`/standalone-products/${productId}`, productData);
  return data;
};

const deleteStandaloneProduct = async ({ productId }: { productId: string }) => {
  const { data } = await api.delete(`/standalone-products/${productId}`);
  return data;
};

export {
  createStandaloneProduct,
  getStandaloneProducts,
  getStandaloneProductById,
  getStandaloneProductsByUser,
  updateStandaloneProduct,
  deleteStandaloneProduct,
};
