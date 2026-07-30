import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  CatalogEndpoint,
  createCatalogItem,
  deleteCatalogItem,
  updateCatalogItem,
} from '@/services/catalogs-admin.service';

type UseCatalogMutationsParams = {
  endpoint: CatalogEndpoint;
  queryKey: string;
  title: string;
};

export function useCatalogMutations({
  endpoint,
  queryKey,
  title,
}: UseCatalogMutationsParams) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  };

  const createItem = useMutation({
    mutationFn: ({ value }: { value: string }) =>
      createCatalogItem({ endpoint, value }),
    onSuccess: () => {
      invalidate();
      toast.success(`Se agregó un elemento en ${title}.`);
    },
    onError: () => toast.error(`No se pudo agregar en ${title}.`),
  });

  const updateItem = useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) =>
      updateCatalogItem({ endpoint, id, value }),
    onSuccess: () => {
      invalidate();
      toast.success(`Se actualizó un elemento en ${title}.`);
    },
    onError: () => toast.error(`No se pudo actualizar en ${title}.`),
  });

  const deleteItem = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteCatalogItem({ endpoint, id }),
    onSuccess: () => {
      invalidate();
      toast.success(`Se eliminó un elemento de ${title}.`);
    },
    onError: () => toast.error(`No se pudo eliminar de ${title}.`),
  });

  return {
    createItem,
    updateItem,
    deleteItem,
  };
}
