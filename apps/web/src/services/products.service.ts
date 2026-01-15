import { api } from '@/lib/axios';

const createProduct = async ({ productData }: { productData: any }) => {
  try {
    const { data } = await api.post(`/products`, productData);
    return data;
  } catch (err) {
    throw err;
  }
};

const getProducts = async () => {
  try {
    const { data } = await api.get('/products');
    return data;
  } catch (err) {
    throw err;
  }
};

const getProductById = async (id: string) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data;
  } catch (err) {
    throw err;
  }
};

const getProductsByUser = async (userId: string) => {
  try {
    const { data } = await api.get(`/products/by-user/${userId}`);
    return data;
  } catch (err) {
    throw err;
  }
};

const updateProduct = async ({
  productId,
  productData,
}: {
  productId: string;
  productData: any;
}) => {
  try {
    const { data } = await api.patch(`/products/${productId}`, productData);
    return data;
  } catch (err) {
    throw err;
  }
};

const deleteProduct = async ({ productId }: { productId: string }) => {
  try {
    const { data } = await api.delete(`/products/${productId}`);
    return data;
  } catch (err) {
    throw err;
  }
};

export {
  createProduct,
  getProducts,
  getProductById,
  getProductsByUser,
  updateProduct,
  deleteProduct,
};
