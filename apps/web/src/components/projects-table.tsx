'use client';

import {
  useCancelFirstValidationProject,
  useAllProjects,
  useCloseProject,
  useDeleteProject,
  useFirstValidationProject,
  useReopenProject,
} from '@/hooks/projects';
import React from 'react';
import LoadingMessage from './loading-message';
import { DataTable, FacetedFilterConfig, facetedFilter } from './ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useQueries } from '@tanstack/react-query';
import { IActivity, IProject, ProjectStatus } from '@repo/types';
import { ProfileInfo } from './profile-info';
import { calculateProgress, copyValue, formatDatePeriod } from '@/lib/utils';
import { Progress } from './ui/progress';
import CopyButton from './ui/copy';
import { Button } from './ui/button';
import { fuzzyFilter } from './ui/data-table';
import { useProjectPrograms } from '@/hooks/catalogs';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Copy,
  DoorOpen,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash,
  Lock,
  Pin,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useProjectProducts } from '@/hooks/products';
import { getActivitiesByEntityId } from '@/services/activities.service';
import { useUserProfile } from 'context/profile-provider';

const normalizeProjectStatus = (status?: string): ProjectStatus => {
  const value = (status ?? '').trim().toUpperCase();

  if (value === 'IN_PROGRESS' || value === 'EN PROGRESO' || value === 'PROGRESS') {
    return ProjectStatus.IN_PROGRESS;
  }

  if (value === 'COMPLETED' || value === 'COMPLETADO') {
    return ProjectStatus.COMPLETED;
  }

  if (
    value === 'FIRST_VALIDATION' ||
    value === 'PRIMERA VALIDACION' ||
    value === 'PRIMERA VALIDACIÓN'
  ) {
    return ProjectStatus.FIRST_VALIDATION;
  }

  if (value === 'CLOSED' || value === 'CERRADO') {
    return ProjectStatus.CLOSED;
  }

  return ProjectStatus.PENDING;
};

const getProjectStatusLabel = (status?: string) => {
  const normalizedStatus = normalizeProjectStatus(status);

  if (normalizedStatus === ProjectStatus.CLOSED) return 'Cerrado';
  if (normalizedStatus === ProjectStatus.FIRST_VALIDATION) return 'Primera validacion';
  if (normalizedStatus === ProjectStatus.IN_PROGRESS) return 'En progreso';
  if (normalizedStatus === ProjectStatus.COMPLETED) return 'Completado';
  return 'Pendiente';
};

const getProjectStatusVariant = (status?: string) => {
  const normalizedStatus = normalizeProjectStatus(status);

  if (normalizedStatus === ProjectStatus.CLOSED) return 'gray' as const;
  if (normalizedStatus === ProjectStatus.FIRST_VALIDATION) return 'blue' as const;
  if (normalizedStatus === ProjectStatus.IN_PROGRESS) return 'blue' as const;
  if (normalizedStatus === ProjectStatus.COMPLETED) return 'green' as const;
  return 'orange' as const;
};

const getDisplayProjectStatus = (
  status: string | undefined,
  progress: number,
): ProjectStatus => {
  const normalizedStatus = normalizeProjectStatus(status);

  if (normalizedStatus !== ProjectStatus.PENDING) {
    return normalizedStatus;
  }

  if (progress >= 100) {
    return ProjectStatus.COMPLETED;
  }

  if (progress > 0) {
    return ProjectStatus.IN_PROGRESS;
  }

  return ProjectStatus.PENDING;
};

type ProjectTableRow = IProject & {
  __derivedProgress: number;
  __derivedStatus: ProjectStatus;
};

const ProjectProgress = ({ progress }: { progress: number }) => {
  return (
    <div>
      {/* Reducimos el min-w para pantallas medianas */}
      <div className="p-1 hover:bg-secondary rounded-md flex gap-2 w-full min-w-32 md:min-w-48 items-center">
        <Progress value={progress} />
        <div className="flex text-xs select-none">
          <span>{progress}</span>
          <span>%</span>
        </div>
      </div>
    </div>
  );
};

const ProjectStatusBadge = ({
  status,
}: {
  status: ProjectStatus;
}) => {
  return (
    <Badge variant={getProjectStatusVariant(status)}>
      {getProjectStatusLabel(status)}
    </Badge>
  );
};

const ProductCount = ({ projectId }: { projectId: string }) => {
  const { data: products, isLoading } = useProjectProducts(projectId);
  return <div>{isLoading ? <LoadingMessage /> : products.length}</div>;
};

const ProjectsActions = ({ project }: { project: ProjectTableRow }) => {
  const { user } = useUserProfile();
  const deleteProject = useDeleteProject();
  const firstValidationProject = useFirstValidationProject();
  const cancelFirstValidationProject = useCancelFirstValidationProject();
  const closeProject = useCloseProject();
  const reopenProject = useReopenProject();
  const effectiveStatus = project.__derivedStatus;
  const isClosed = effectiveStatus === ProjectStatus.CLOSED;
  const closedById =
    typeof project.closedBy === 'string' ? project.closedBy : project.closedBy?._id;
  const hasFirstValidation = Boolean(project.firstValidatedBy);
  const canFirstValidate = Boolean(
    !isClosed &&
      effectiveStatus === ProjectStatus.COMPLETED &&
      user?.canValidateProjets &&
      !hasFirstValidation,
  );
  const canReopen = Boolean(
    isClosed &&
      user?.canCloseProject &&
      closedById &&
      closedById === user?._id,
  );
  const canClose = Boolean(
    !isClosed &&
      (effectiveStatus === ProjectStatus.COMPLETED ||
        effectiveStatus === ProjectStatus.FIRST_VALIDATION) &&
      user?.canCloseProject &&
      hasFirstValidation,
  );
  const canCancelFirstValidation = Boolean(
    !isClosed &&
      effectiveStatus === ProjectStatus.FIRST_VALIDATION &&
      user?.canValidateProjets &&
      hasFirstValidation,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/admin/proyectos/${project._id}`}>
            <ExternalLink /> Visitar proyecto
          </Link>
        </DropdownMenuItem>
        {!isClosed && (
          <DropdownMenuItem asChild>
            <Link href={`/admin/proyectos/${project._id}/editar`}>
              <Pencil /> Editar proyecto
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild onClick={() => copyValue(project._id)}>
          <span>
            <Copy /> Copiar ID
          </span>
        </DropdownMenuItem>

        {canFirstValidate && (
          <DropdownMenuItem
            onClick={() => firstValidationProject.mutate(project._id)}
            disabled={firstValidationProject.isPending}
          >
            <Pin />
            Primera validación
          </DropdownMenuItem>
        )}

        {canCancelFirstValidation && (
          <DropdownMenuItem
            onClick={() => cancelFirstValidationProject.mutate(project._id)}
            disabled={cancelFirstValidationProject.isPending}
          >
            <XCircle />
            Cancelar primera validación
          </DropdownMenuItem>
        )}

        {canClose && (
          <DropdownMenuItem
            onClick={() => closeProject.mutate(project._id)}
            disabled={closeProject.isPending}
          >
            <Lock /> Cerrar proyecto (2da validación)
          </DropdownMenuItem>
        )}

        {canReopen && (
          <DropdownMenuItem
            onClick={() => reopenProject.mutate(project._id)}
            disabled={reopenProject.isPending}
          >
            <DoorOpen /> Reabrir proyecto
          </DropdownMenuItem>
        )}

        {!isClosed && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="hover:text-destructive-foreground">
              <Dialog>
                <DialogTrigger className="has-[>svg]:px-2 [&_svg]:text-muted-foreground hover:[&_svg]:text-destructive-foreground px-0 border-transparent w-full h-8 justify-start hover:text-destructive-foreground font-normal">
                  <Trash />
                  Eliminar proyecto
                </DialogTrigger>
                <DialogContent>
                  <Badge variant="destructive">Eliminando</Badge>
                  <DialogTitle>{project.name}</DialogTitle>
                  <DialogDescription>
                    ¿Seguro deseas eliminar el proyecto? Esta es una operación
                    irreversible.
                  </DialogDescription>
                  <div className="flex gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        onClick={() => deleteProject.mutate(project._id)}
                        variant="destructive"
                      >
                        Eliminar
                      </Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const columns: ColumnDef<ProjectTableRow>[] = [
  {
    accessorKey: 'name',
    header: 'Nombre',
    filterFn: fuzzyFilter,
    cell: ({ row }) => {
      const name = String(row.getValue('name'));

      return (
        /* Controlamos los anchos máximos por breakpoint para evitar textos infinitos en pantallas compactas */
        <div className="relative group flex justify-between w-full">
          <div className="max-w-44 sm:max-w-60 md:max-w-85 overflow-x-auto">
            <span>{name}</span>
          </div>
          <CopyButton
            valueToCopy={name}
            className="opacity-0 group-hover:opacity-100 hidden sm:flex"
          />
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const project = row.original;
      return <ProjectsActions project={project} />;
    },
  },
  {
    id: 'progress',
    header: 'Progreso',
    meta: { className: 'hidden sm:table-cell' }, /* Visible en tablets pequeñas en adelante */
    cell: ({ row }) => {
      const project = row.original;
      return <ProjectProgress progress={project.__derivedProgress} />;
    },
  },
  {
    id: 'status',
    accessorFn: (project) => project.__derivedStatus,
    header: 'Estado',
    filterFn: facetedFilter,
    meta: { className: 'hidden md:table-cell' }, /* Oculto en móviles comunes */
    cell: ({ row }) => {
      const project = row.original;
      return <ProjectStatusBadge status={project.__derivedStatus} />;
    },
  },
  {
    id: 'program',
    accessorFn: (project) => project.program?.name ?? 'Sin programa',
    header: 'Programa',
    filterFn: facetedFilter,
    meta: { className: 'hidden lg:table-cell' }, /* Visible solo en pantallas medianas-grandes */
    cell: ({ row }) => {
      const project = row.original;
      return <span className="truncate max-w-40 block">{project.program?.name ?? 'Sin programa'}</span>;
    },
  },
  {
    id: 'products',
    header: 'Productos',
    meta: { className: 'hidden md:table-cell' },
    cell: ({ row }) => {
      const { _id } = row.original;
      return <ProductCount projectId={_id} />;
    },
  },
  {
    id: 'period',
    accessorFn: (project) => {
      const periodDate = project.endDate ?? project.startDate;
      const timestamp = periodDate ? new Date(periodDate).getTime() : NaN;

      if (Number.isNaN(timestamp)) return 'Sin año';
      return String(new Date(timestamp).getFullYear());
    },
    header: 'Periodo',
    filterFn: facetedFilter,
    meta: { className: 'hidden xl:table-cell' }, /* Solo en monitores anchos */
    cell: ({ row }) => {
      const { startDate, endDate } = row.original;
      return (
        <div className="whitespace-nowrap">
          <span>{formatDatePeriod(startDate, endDate)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'impactLevel',
    header: 'Impacto',
    filterFn: facetedFilter,
    meta: { className: 'hidden lg:table-cell' },
  },
  {
    id: 'owner',
    accessorFn: (project) => project.owner?._id ?? 'Sin propietario',
    header: 'Propietario',
    filterFn: facetedFilter,
    meta: { className: 'hidden md:table-cell' },
    cell: ({ row }) => {
      const project = row.original;
      const { owner } = project;

      if (!owner) return <div className="w-40 md:w-52 text-muted-foreground">Vacío</div>;

      return (
        <div className="w-40 md:w-52">
          <ProfileInfo
            size="sm"
            givenName={owner.givenName}
            familyName={owner.familyName}
            email={owner.email}
            avatarUrl={owner.avatarUrl}
          />
        </div>
      );
    },
  },
  {
    accessorKey: 'trlRating',
    header: 'Nivel TRL',
    filterFn: facetedFilter,
    meta: { className: 'hidden xl:table-cell' },
  },
];

const facetedFilters: FacetedFilterConfig[] = [
  {
    columnId: 'trlRating',
    title: 'Nivel TRL',
    options: [
      { label: 'TRL 1', value: '1' },
      { label: 'TRL 2', value: '2' },
      { label: 'TRL 3', value: '3' },
      { label: 'TRL 4', value: '4' },
      { label: 'TRL 5', value: '5' },
      { label: 'TRL 6', value: '6' },
      { label: 'TRL 7', value: '7' },
      { label: 'TRL 8', value: '8' },
      { label: 'TRL 9', value: '9' },
    ],
  },
  {
    columnId: 'impactLevel',
    title: 'Nivel de Impacto',
    options: [
      { label: 'Local', value: 'Local' },
      { label: 'Nacional', value: 'Nacional' },
      { label: 'Internacional', value: 'Internacional' },
    ],
  },
  {
    columnId: 'status',
    title: 'Estado',
    options: [
      { label: 'Pendiente', value: ProjectStatus.PENDING },
      { label: 'En progreso', value: ProjectStatus.IN_PROGRESS },
      { label: 'Completado', value: ProjectStatus.COMPLETED },
      { label: 'Primera validacion', value: ProjectStatus.FIRST_VALIDATION },
      { label: 'Cerrado', value: ProjectStatus.CLOSED },
    ],
  },
  {
    columnId: 'period',
    title: 'Año',
    options: [],
  },
  {
    columnId: 'program',
    title: 'Programa',
    options: [],
  },
  {
    columnId: 'owner',
    title: 'Usuario',
    options: [],
  },
];

export default function ProjectsTable() {
  const { data: projects, isLoading: loadingProjects } = useAllProjects();
  const typedProjects = React.useMemo(() => (projects ?? []) as IProject[], [projects]);

  const projectActivitiesQueries = useQueries({
    queries: typedProjects.map((project) => ({
      queryKey: ['activities', project._id],
      queryFn: () => getActivitiesByEntityId(project._id),
      enabled: Boolean(project._id),
    })),
  });

  const projectsWithDerivedStatus = React.useMemo<ProjectTableRow[]>(() => {
    if (!typedProjects.length) return [];

    return typedProjects.map((project, index) => {
      const queryData = projectActivitiesQueries[index]?.data as IActivity[] | undefined;
      const progress = calculateProgress(queryData ?? []);
      const derivedStatus = getDisplayProjectStatus(project.status, progress);

      return {
        ...project,
        __derivedProgress: progress,
        __derivedStatus: derivedStatus,
      };
    });
  }, [typedProjects, projectActivitiesQueries]);

  const yearFilterOptions = React.useMemo<FacetedFilterConfig['options']>(() => {
    if (!projectsWithDerivedStatus.length) return [];

    const years: string[] = Array.from(
      new Set(
        projectsWithDerivedStatus
          .map((project) => {
            const periodDate = project.endDate ?? project.startDate;
            const timestamp = periodDate ? new Date(periodDate).getTime() : NaN;
            if (Number.isNaN(timestamp)) return null;
            return String(new Date(timestamp).getFullYear());
          })
          .filter((year: string | null): year is string => Boolean(year)),
      ),
    ).sort((a, b) => Number(b) - Number(a));

    return years.map((year) => ({ label: year, value: year }));
  }, [projectsWithDerivedStatus]);

  const programFilterOptions = React.useMemo<FacetedFilterConfig['options']>(() => {
    if (!projectsWithDerivedStatus.length) return [];

    const programs: string[] = Array.from(
      new Set(
        projectsWithDerivedStatus
          .map((project) => project.program?.name ?? 'Sin programa')
          .filter((program): program is string => Boolean(program)),
      ),
    ).sort();

    return programs.map((program) => ({ label: program, value: program }));
  }, [projectsWithDerivedStatus]);

  const ownerFilterOptions = React.useMemo<FacetedFilterConfig['options']>(() => {
    if (!projectsWithDerivedStatus.length) return [];

    const ownersMap = new Map<string, string>();

    projectsWithDerivedStatus.forEach((project) => {
      const ownerId = project.owner?._id ?? 'Sin propietario';

      if (ownersMap.has(ownerId)) {
        return;
      }

      if (!project.owner) {
        ownersMap.set(ownerId, 'Sin propietario');
        return;
      }

      const fullName = `${project.owner.givenName ?? ''} ${project.owner.familyName ?? ''}`.trim();
      const ownerLabel = fullName || project.owner.email || 'Sin nombre';
      ownersMap.set(ownerId, ownerLabel);
    });

    return Array.from(ownersMap.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }, [projectsWithDerivedStatus]);

  const projectFacetedFilters = React.useMemo<FacetedFilterConfig[]>(
    () =>
      facetedFilters.map((filter): FacetedFilterConfig =>
        filter.columnId === 'period'
          ? { ...filter, options: yearFilterOptions }
          : filter.columnId === 'program'
          ? { ...filter, options: programFilterOptions }
          : filter.columnId === 'owner'
          ? { ...filter, options: ownerFilterOptions }
          : filter,
      ),
    [yearFilterOptions, programFilterOptions, ownerFilterOptions],
  );

  const sortedProjects = React.useMemo(() => {
    if (!projectsWithDerivedStatus.length) return [];

    return [...projectsWithDerivedStatus].sort((a, b) => {
      const aMain = new Date(a.endDate ?? a.startDate).getTime();
      const bMain = new Date(b.endDate ?? b.startDate).getTime();

      if (bMain !== aMain) return bMain - aMain;

      const aStart = new Date(a.startDate).getTime();
      const bStart = new Date(b.startDate).getTime();
      return bStart - aStart;
    });
  }, [projectsWithDerivedStatus]);

  return (
    <div className="max-w-7xl w-full p-1">
      {loadingProjects ? (
        <LoadingMessage message="Cargando proyectos" />
      ) : (
        <DataTable
          columns={columns}
          data={sortedProjects}
          facetedFilters={projectFacetedFilters}
        />
      )}
    </div>
  );
}