'use client';

import {
  useProductCategories,
  useProductSubcategories,
} from '@/hooks/catalogs';
import { productSchema } from '@/schemas/product.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { CoAuthor, SeedCategory } from '@repo/types';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import LoadingMessage from '../loading-message';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '../ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from '../ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import { DialogClose } from '../ui/dialog';

export function CreateProductForm() {
  const { data: categories, isLoading: loadingCategories } =
    useProductCategories();
  const { data: subcategories, isLoading: loadingSubcategories } =
    useProductSubcategories();

  const form = useForm({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      details: '',
      category: '',
      subcategory: '',
      coAuthor: CoAuthor.A,
    },
  });

  /**
   * Handlers
   */
  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    try {
      console.log('FORM DATA', data);
      const cleanedData = {
        ...data,
        details: data.details === '' ? undefined : data.details,
      };
      console.log('CLEAN DATA', cleanedData);
    } catch (err) {
      console.error('Error on submit', err);
    }
  };

  const onError = (erros: any) => {
    console.log('FORM ERRORS', erros);
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(onSubmit, onError)}
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nombre *</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Ingresa el nombre del producto"
                />
                <InputGroupAddon align="inline-end">
                  {field.value?.length}/100
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="category"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor={field.name}>Categoría *</FieldLabel>
              </FieldContent>
              <Select {...field} onValueChange={field.onChange}>
                <SelectTrigger
                  id={field.name}
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {loadingCategories ? (
                    <LoadingMessage message="Cargando Programas" />
                  ) : (
                    categories.map((category: SeedCategory) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="subcategory"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Subcategoría *</FieldLabel>
              <Select {...field} onValueChange={field.onChange}>
                <SelectTrigger
                  id={field.name}
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Selecciona una subcategoría" />
                </SelectTrigger>
                <SelectContent>
                  {loadingSubcategories ? (
                    <LoadingMessage message="Cargando Programas" />
                  ) : (
                    subcategories.map((subcategory: SeedCategory) => (
                      <SelectItem key={subcategory._id} value={subcategory._id}>
                        {subcategory.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="details"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor={field.name}>Detalle</FieldLabel>
              </FieldContent>
              <InputGroup>
                <InputGroupTextarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Detalla el tipo de producto y autor"
                />
                <InputGroupAddon align="block-end">
                  {field.value?.length}/255
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="coAuthor"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Co Author</FieldLabel>
              <Select {...field} onValueChange={field.onChange}>
                <SelectTrigger
                  id={field.name}
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Selecciona un programa" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CoAuthor).map((author) => (
                    <SelectItem key={author} value={author}>
                      {author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex gap-2">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit">Crear producto</Button>
      </div>
    </form>
  );
}
