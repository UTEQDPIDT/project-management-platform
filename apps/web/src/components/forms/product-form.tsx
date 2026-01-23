'use client';

import {
  useProductCategories,
  useProductSubcategories,
} from '@/hooks/catalogs';
import { getProductSchema } from '@/schemas/product.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { CoAuthor, IFile, IProduct, SeedCategory } from '@repo/types';
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
import { useCreateProduct, useUpdateProduct } from '@/hooks/products';
import { Input } from '../ui/input';
import { useFilesForEntity } from '@/hooks/files';
import { toast } from 'sonner';

interface Props {
  product?: IProduct;
  projectId: string;
}

export function ProductForm({ projectId, product }: Props) {
  const { data: categories, isLoading: loadingCategories } =
    useProductCategories();
  const { data: subcategories, isLoading: loadingSubcategories } =
    useProductSubcategories();

  let currentFile: IFile;
  if (product) {
    const { data: files, isLoading: loadingFile } = useFilesForEntity(
      product?._id,
    );

    currentFile = Array.isArray(files) ? files[0] : files;
  }

  // Safely get the first file if it's an array, or use it directly if it's an object

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  const form = useForm({
    resolver: zodResolver(getProductSchema(!!product)),
    mode: 'onChange',
    defaultValues: {
      name: product?.name || '',
      category: product?.category._id || '',
      subcategory: product?.subcategory._id || '',
      coAuthor: product?.coAuthor || CoAuthor.A,
    },
  });

  /**
   * Handlers
   */
  const onSubmit = async (
    data: z.infer<ReturnType<typeof getProductSchema>>,
  ) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('category', data.category);
      formData.append('subcategory', data.subcategory);
      formData.append('coAuthor', data.coAuthor);
      formData.append('projectId', projectId);

      if (data.file) {
        formData.append('file', data.file);
      }

      if (product) {
        updateProduct.mutate({
          productId: product._id,
          productData: formData,
        });
      } else {
        createProduct.mutate({ productData: formData });
        form.reset();
      }
    } catch (err) {
      console.error('Error on submit', err);
    }
  };

  const onError = (erros: any) => {
    toast.error('Por favor corrige los errores en el formulario');
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
          name="coAuthor"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Tipo de Co Author</FieldLabel>
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

        <Controller
          control={form.control}
          name="file"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor={field.name}>
                  Archivo {!product && '*'}
                </FieldLabel>
              </FieldContent>

              {currentFile &&
                typeof currentFile === 'object' &&
                currentFile.originalName && (
                  <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Archivo actual:</span>{' '}
                      {currentFile.originalName}
                    </p>
                  </div>
                )}

              <Input
                id={field.name}
                name={field.name}
                aria-invalid={fieldState.invalid}
                type="file"
                accept=".pdf"
                onChange={(e) => field.onChange(e.target.files?.[0])}
                onBlur={field.onBlur}
                disabled={field.disabled}
              />

              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <FieldDescription>
                  Solo se aceptan archivos PDF
                </FieldDescription>
              )}
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

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoadingMessage /> : product ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
