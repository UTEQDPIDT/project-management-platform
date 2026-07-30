'use client';

import {
  useDevelopmentLines,
  useDivisions,
  useKnowledgeAreas,
  usePndPriorities,
  useProductCategories,
  useProductSubcategories,
  usePrograms,
  useProjectPrograms,
  useSustainableGoals,
  useThemedImpactAreas,
} from '@/hooks/catalogs';
import { useCatalogMutations } from '@/hooks/catalogs/use-catalog-mutations';
import { CatalogEndpoint } from '@/services/catalogs-admin.service';
import { Loader2, Pencil, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import LoadingMessage from './loading-message';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

type CatalogRecord = {
  _id: string;
  [key: string]: unknown;
};

type CatalogSection = {
  id: string;
  title: string;
  endpoint: CatalogEndpoint;
  queryKey: string;
  fieldName: string;
  items: CatalogRecord[];
  isLoading: boolean;
  isError: boolean;
};

function getLabel(record: CatalogRecord, fieldName: string) {
  const value = record[fieldName];
  return typeof value === 'string' ? value : '';
}

function CatalogCrudCard({ section }: { section: CatalogSection }) {
  const [newValue, setNewValue] = useState('');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { createItem, updateItem, deleteItem } = useCatalogMutations({
    endpoint: section.endpoint,
    queryKey: section.queryKey,
    title: section.title,
  });

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return section.items;

    return section.items.filter((item) =>
      getLabel(item, section.fieldName).toLowerCase().includes(normalizedSearch),
    );
  }, [search, section.fieldName, section.items]);

  const isBusy =
    createItem.isPending || updateItem.isPending || deleteItem.isPending;

  const handleCreate = () => {
    const value = newValue.trim();
    if (!value) return;

    createItem.mutate(
      { value },
      {
        onSuccess: () => {
          setNewValue('');
        },
      },
    );
  };

  const startEdit = (item: CatalogRecord) => {
    setEditingId(item._id);
    setEditingValue(getLabel(item, section.fieldName));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const saveEdit = () => {
    if (!editingId) return;

    const value = editingValue.trim();
    if (!value) return;

    updateItem.mutate(
      { id: editingId, value },
      {
        onSuccess: () => {
          cancelEdit();
        },
      },
    );
  };

  return (
    <Card className="border-neutral-400">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between gap-2">
          <span>{section.title}</span>
          <Badge variant="outline">{section.items.length}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <Input
            className="border rounded-md border-neutral-400"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={`Agregar en ${section.title.toLowerCase()}...`}
            disabled={isBusy}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
          <Button
            className="w-full sm:w-auto"
            onClick={handleCreate}
            disabled={isBusy || !newValue.trim()}
          >
            {createItem.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="relative border rounded-md border-neutral-400">
          <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="pl-8"
          />
        </div>

        {section.isLoading ? (
          <LoadingMessage message="Cargando elementos" />
        ) : section.isError ? (
          <p className="text-sm text-red-600">No se pudieron cargar los elementos.</p>
        ) : filteredItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay elementos para mostrar.</p>
        ) : (
          <div className="max-h-72 overflow-y-auto rounded-md border border-neutral-200">
            <ul className="divide-y divide-neutral-200">
              {filteredItems.map((item) => {
                const isEditing = editingId === item._id;
                const isDeletePopoverOpen = confirmDeleteId === item._id;
                const itemLabel = getLabel(item, section.fieldName);

                return (
                  <li key={item._id} className="p-2 sm:p-3">
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          disabled={updateItem.isPending}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              saveEdit();
                            }
                            if (e.key === 'Escape') {
                              e.preventDefault();
                              cancelEdit();
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={saveEdit}
                          disabled={updateItem.isPending || !editingValue.trim()}
                        >
                          {updateItem.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-start sm:items-center justify-between gap-2">
                        <span className="text-sm leading-5 wrap-break-word">
                          {itemLabel}
                        </span>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(item)}
                            disabled={isBusy}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Popover
                            open={isDeletePopoverOpen}
                            onOpenChange={(open) =>
                              setConfirmDeleteId(open ? item._id : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={isBusy}
                              >
                                {deleteItem.isPending && isDeletePopoverOpen ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-3" align="end">
                              <div className="space-y-3">
                                <p className="text-sm font-medium">Confirmar eliminación</p>
                                <p className="text-xs text-muted-foreground wrap-break-word">
                                  Esta acción eliminará "{itemLabel}" y no se puede deshacer.
                                </p>
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setConfirmDeleteId(null)}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={deleteItem.isPending}
                                    onClick={() => {
                                      deleteItem.mutate(
                                        { id: item._id },
                                        {
                                          onSuccess: () => {
                                            setConfirmDeleteId(null);
                                          },
                                        },
                                      );
                                    }}
                                  >
                                    {deleteItem.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      'Eliminar'
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminCatalogsManager() {
  const divisionsQuery = useDivisions();
  const programsQuery = usePrograms();
  const categoriesQuery = useProductCategories();
  const subcategoriesQuery = useProductSubcategories();
  const knowledgeAreasQuery = useKnowledgeAreas();
  const themedImpactAreasQuery = useThemedImpactAreas();
  const pndPrioritiesQuery = usePndPriorities();
  const developmentLinesQuery = useDevelopmentLines();
  const sustainabilityGoalsQuery = useSustainableGoals();
  const projectProgramsQuery = useProjectPrograms();

  const sections: CatalogSection[] = [
    {
      id: 'divisions',
      title: 'Divisiones',
      endpoint: 'divisions',
      queryKey: 'divisions',
      fieldName: 'name',
      items: (divisionsQuery.data ?? []) as CatalogRecord[],
      isLoading: divisionsQuery.isLoading,
      isError: divisionsQuery.isError,
    },
    {
      id: 'programs',
      title: 'Programas Educativos',
      endpoint: 'educational-programs',
      queryKey: 'programs',
      fieldName: 'name',
      items: (programsQuery.data ?? []) as CatalogRecord[],
      isLoading: programsQuery.isLoading,
      isError: programsQuery.isError,
    },
    {
      id: 'product-categories',
      title: 'Categorías de Producto',
      endpoint: 'product-categories',
      queryKey: 'product-categories',
      fieldName: 'name',
      items: (categoriesQuery.data ?? []) as CatalogRecord[],
      isLoading: categoriesQuery.isLoading,
      isError: categoriesQuery.isError,
    },
    {
      id: 'product-subcategories',
      title: 'Subcategorías de Producto',
      endpoint: 'product-subcategories',
      queryKey: 'product-subcategories',
      fieldName: 'name',
      items: (subcategoriesQuery.data ?? []) as CatalogRecord[],
      isLoading: subcategoriesQuery.isLoading,
      isError: subcategoriesQuery.isError,
    },
    {
      id: 'knowledge-areas',
      title: 'Áreas de Conocimiento',
      endpoint: 'knowledge-areas',
      queryKey: 'knowledge-areas',
      fieldName: 'name',
      items: (knowledgeAreasQuery.data ?? []) as CatalogRecord[],
      isLoading: knowledgeAreasQuery.isLoading,
      isError: knowledgeAreasQuery.isError,
    },
    {
      id: 'themed-impact-areas',
      title: 'Impactos Temáticos Transversales',
      endpoint: 'themed-impact-areas',
      queryKey: 'themed-impact-areas',
      fieldName: 'name',
      items: (themedImpactAreasQuery.data ?? []) as CatalogRecord[],
      isLoading: themedImpactAreasQuery.isLoading,
      isError: themedImpactAreasQuery.isError,
    },
    {
      id: 'pnd-priorities',
      title: 'Prioridades PND',
      endpoint: 'pnd-priorities',
      queryKey: 'pnd-priorities',
      fieldName: 'name',
      items: (pndPrioritiesQuery.data ?? []) as CatalogRecord[],
      isLoading: pndPrioritiesQuery.isLoading,
      isError: pndPrioritiesQuery.isError,
    },
    {
      id: 'development-lines',
      title: 'Líneas de Desarrollo',
      endpoint: 'development-lines',
      queryKey: 'development-lines',
      fieldName: 'name',
      items: (developmentLinesQuery.data ?? []) as CatalogRecord[],
      isLoading: developmentLinesQuery.isLoading,
      isError: developmentLinesQuery.isError,
    },
    {
      id: 'sustainability-goals',
      title: 'Objetivos de Sostenibilidad',
      endpoint: 'sustainability-goals',
      queryKey: 'sustainable-goals',
      fieldName: 'name',
      items: (sustainabilityGoalsQuery.data ?? []) as CatalogRecord[],
      isLoading: sustainabilityGoalsQuery.isLoading,
      isError: sustainabilityGoalsQuery.isError,
    },
    {
      id: 'project-programs',
      title: 'Programas de Proyecto',
      endpoint: 'project-programs',
      queryKey: 'projectPrograms',
      fieldName: 'name',
      items: (projectProgramsQuery.data ?? []) as CatalogRecord[],
      isLoading: projectProgramsQuery.isLoading,
      isError: projectProgramsQuery.isError,
    },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {sections.map((section) => (
        <CatalogCrudCard key={section.id} section={section} />
      ))}
    </div>
  );
}
