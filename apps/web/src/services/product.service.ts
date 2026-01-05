import { api } from '@/lib/axios';
import { IProduct } from '@repo/types';

const createProduct = async ({
  productData,
}: {
  productData: Pick<
    IProduct,
    'name' | 'category' | 'subcategory' | 'details' | 'coAuthor'
  >;
}) => {
  try {
    const { data } = await api.post('/products', productData);
    return data;
  } catch (err) {
    console.error('Error creating product', err);
  }
};

const getProducts = async () => {
  try {
    const { data } = await api.get('/products');
    return data;
  } catch (err) {
    console.error('Error fetching all products', err);
  }
};

const getProductById = async (id: string) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data;
  } catch (err) {
    console.error(`Error fetching product by ID: ${id}`, err);
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
    console.error(`Error updating product with ID: ${productId}`, err);
  }
};

const deleteProduct = async (id: string) => {
  try {
    await api.delete(`/products/${id}`);
  } catch (err) {
    console.error(`Error deleting product ID ${id}`, err);
  }
};

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
