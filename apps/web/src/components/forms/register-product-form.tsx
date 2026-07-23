import { mongoId } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { IProduct } from '@repo/types';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import { Button } from '../ui/button';
import { DialogClose } from '../ui/dialog';
import {
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '../ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandGroup, CommandItem } from '../ui/command';
import LoadingMessage from '../loading-message';
import { useProductsByUser } from '@/hooks/products';
import { useUserProfile } from 'context/profile-provider';
import { useRegisterProducts } from '@/hooks/events';
import { toast } from 'sonner';

interface RegisterProductsForm {
  eventId: string;
  products: IProduct[];
}

const schema = z.object({
  products: z.array(mongoId),
});

export default function RegisterProductsForm({
  eventId,
  products,
}: RegisterProductsForm) {
  const { user } = useUserProfile();

  /**
   * Tanstack
   */
  const { data: userProducts, isLoading: loadingProducts } = useProductsByUser(
    user._id,
  );
  const registerProducts = useRegisterProducts();

  // Filter already registered products
  const registeredProductsId = new Set(products.map((p: IProduct) => p._id));

  let notRegisteredProducts = [];

  if (userProducts) {
    notRegisteredProducts = userProducts.filter(
      (p: IProduct) => !registeredProductsId.has(p._id),
    );
  }

  /**
   * React hook form
   */
  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      products: products ? products.map((p: IProduct) => p._id) : [],
    },
  });

  const onSubmit = async (products: z.infer<typeof schema>) => {
    console.log('DATA', products);
    registerProducts.mutate({ eventId, products });
  };

  const onError = () => {
    // console.log('FORM ERRORS', errors);
    toast.error('Por favor corrige los errores en el formulario');
  };

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={form.handleSubmit(onSubmit, onError)}
    >
      <Controller
        control={form.control}
        name="products"
        render={({ field }) => {
          const value = field.value ?? [];

          return (
            <FieldGroup>
              <FieldContent>
                <FieldLabel>Tus Productos</FieldLabel>
                <FieldDescription>
                  Selecciona los productos a registrar.
                </FieldDescription>
              </FieldContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-normal"
                  >
                    {value.length ? (
                      `${value.length} seleccionados`
                    ) : (
                      <span className="text-muted-foreground font-normal">
                        Sin selección
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[calc(100vw-2rem)] sm:w-full md:w-md max-h-96 overflow-y-auto p-0">
                  <Command>
                    <CommandGroup>
                      {loadingProducts ? (
                        <CommandItem disabled>
                          <LoadingMessage />
                        </CommandItem>
                      ) : notRegisteredProducts &&
                        notRegisteredProducts.length ? (
                        notRegisteredProducts.map((product: IProduct) => {
                          const selected = value.includes(product._id);

                          return (
                            <CommandItem
                              key={product._id}
                              onSelect={() => {
                                field.onChange(
                                  selected
                                    ? value.filter((v) => v !== product._id)
                                    : [...value, product._id],
                                );
                              }}
                              className="flext justify-between"
                            >
                              {product.name}
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  selected ? 'opacity-100' : 'opacity-0'
                                }`}
                              />
                            </CommandItem>
                          );
                        })
                      ) : (
                        <div className="w-full select-none p-2 flex items-center justify-center">
                          <span className="text-muted-foreground text-sm">
                            No hay productos para seleccionar
                          </span>
                        </div>
                      )}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </FieldGroup>
          );
        }}
      />

      <div className="flex gap-2">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </DialogClose>

        <DialogClose asChild>
          <Button type="submit">Registrar</Button>
        </DialogClose>
      </div>
    </form>
  );
}
