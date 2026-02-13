import { api } from '@/lib/axios';

const createProduct = async ({ productData }: { productData: FormData }) => {
  const { data } = await api.post(`/products`, productData);
  return data;
};

const getProducts = async () => {
  const { data } = await api.get('/products');
  return data;
};

const getProductById = async (id: string) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

const getProductsByUser = async (userId: string) => {
  const { data } = await api.get(`/products/by-user/${userId}`);
  return data;
};

const getProductsByProject = async (projectId: string) => {
  const { data } = await api.get(`/products/by-project/${projectId}`);
  return data;
};

const updateProduct = async ({
  productId,
  productData,
}: {
  productId: string;
  productData: FormData;
}) => {
  const { data } = await api.patch(`/products/${productId}`, productData);
  return data;
};

const deleteProduct = async ({ productId }: { productId: string }) => {
  const { data } = await api.delete(`/products/${productId}`);
  return data;
};

export {
  createProduct,
  getProducts,
  getProductById,
  getProductsByUser,
  getProductsByProject,
  updateProduct,
  deleteProduct,
};
