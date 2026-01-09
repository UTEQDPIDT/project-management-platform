import { api } from '@/lib/axios';
import { IProduct } from '@repo/types';
import { toast } from 'sonner';

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

const getProductsByUser = async (userId: string) => {
  try {
    const { data } = await api.get(`/products/by-user/${userId}`);
    return data;
  } catch (err) {
    console.error('Error fetching user products', err);
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
    const { status } = await api.patch(`/products/${productId}`, productData);

    if (status === 200 || 202) {
      toast.success('Se ha actualizado el producto');
    }
  } catch (err) {
    console.error(`Error updating product with ID: ${productId}`, err);
    toast.error('No se ha actualizado el producto');
  }
};

export { getProducts, getProductById, getProductsByUser, updateProduct };
