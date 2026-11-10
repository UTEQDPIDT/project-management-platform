'use client';

import { Controller, UseFormReturn } from 'react-hook-form';
import { Check, ChevronsUpDown } from 'lucide-react';
import { DevelopmentLineSubcategory, SeedCategory } from '@repo/types';
import {
  useDevelopmentLines,
  useDevelopmentLineSubcategories,
} from '@/hooks/catalogs';
import { Button } from '../ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '../ui/command';
import {
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '../ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const MAX_SUBCATEGORIES = 2;

type InnovationLinesFormValues = {
  innovationLines: string[];
  innovationLinesSubcategories: string[];
};

interface InnovationLinesFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

export function InnovationLinesFields({ form }: InnovationLinesFieldsProps) {
  const { data: developmentLines = [], isLoading: loadingLines } =
    useDevelopmentLines();

  const innovationLines: InnovationLinesFormValues['innovationLines'] =
    form.watch('innovationLines') ?? [];
  const selectedLineId = innovationLines[0];

  const { data: subcategories = [], isLoading: loadingSubcategories } =
    useDevelopmentLineSubcategories(selectedLineId);

  return (
    <>
      <Controller
        control={form.control}
        name="innovationLines"
        render={({ field, fieldState }) => (
          <FieldGroup>
            <FieldContent>
              <FieldLabel>
                Líneas Innovadoras de Investigación Aplicada y Desarrollo
                Tecnológico (LIIADT&apos;s)
              </FieldLabel>
              <FieldDescription>
                Selecciona la LIIADT estratégica de la UTEQ con la que se
                relaciona el proyecto.
              </FieldDescription>
            </FieldContent>
            <Select
              value={selectedLineId ?? ''}
              disabled={loadingLines}
              onValueChange={(lineId) => {
                field.onChange([lineId]);
                // Las subcategorías dependen de la línea elegida.
                form.setValue('innovationLinesSubcategories', [], {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={loadingLines ? 'Cargando' : 'Sin selección'}
                />
              </SelectTrigger>
              <SelectContent>
                {developmentLines.map((line: SeedCategory) => (
                  <SelectItem key={line._id} value={line._id}>
                    {line.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </FieldGroup>
        )}
      />

      {selectedLineId && (
        <Controller
          control={form.control}
          name="innovationLinesSubcategories"
          render={({ field, fieldState }) => {
            const value: string[] = field.value ?? [];

            return (
              <FieldGroup>
                <FieldContent>
                  <FieldLabel>Subcategorías de la línea</FieldLabel>
                  <FieldDescription>
                    Selecciona hasta {MAX_SUBCATEGORIES} subcategorías.
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
                        `${value.length} seleccionadas`
                      ) : (
                        <span className="text-muted-foreground">
                          Sin selección
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[calc(100vw-2rem)] sm:w-full lg:max-w-2xl max-h-96 overflow-y-auto p-0 border border-gray-400">
                    <Command
                      filter={(itemValue, search) =>
                        itemValue.toLowerCase().includes(search.toLowerCase())
                          ? 1
                          : 0
                      }
                    >
                      <CommandInput placeholder="Buscar subcategoría..." />
                      <CommandEmpty>
                        No se encontraron subcategorías.
                      </CommandEmpty>
                      <CommandGroup>
                        {loadingSubcategories ? (
                          <CommandItem disabled>Cargando</CommandItem>
                        ) : (
                          subcategories.map(
                            (subcategory: DevelopmentLineSubcategory) => {
                              const selected = value.includes(subcategory._id);
                              const limitReached =
                                !selected && value.length >= MAX_SUBCATEGORIES;

                              return (
                                <CommandItem
                                  key={subcategory._id}
                                  value={subcategory.name}
                                  disabled={limitReached}
                                  onSelect={() =>
                                    field.onChange(
                                      selected
                                        ? value.filter(
                                            (v) => v !== subcategory._id,
                                          )
                                        : [...value, subcategory._id],
                                    )
                                  }
                                  className="flex justify-between cursor-pointer"
                                >
                                  {subcategory.name}
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      selected ? 'opacity-100' : 'opacity-0'
                                    }`}
                                  />
                                </CommandItem>
                              );
                            },
                          )
                        )}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldGroup>
            );
          }}
        />
      )}
    </>
  );
}
