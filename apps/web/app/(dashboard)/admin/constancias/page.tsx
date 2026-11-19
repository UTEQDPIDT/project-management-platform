'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import axios from 'axios';
import { Download, Eye, MoreHorizontal, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import { Header, HeaderAction, HeaderHeading, HeaderTitle } from '@/components/header';
import { PageContent } from '@/components/page-content';
import { ProfileInfo } from '@/components/profile-info';
import FilePreviewDialog from '@/components/file-preview-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable, facetedFilter, fuzzyFilter, type FacetedFilterConfig } from '@/components/ui/data-table';

type Recognition = {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatarUrl?: string;
  folio: string;
  year: number;
  issuedAt: string;
};
type Teacher = { _id: string; givenName: string; familyName: string; email: string };
type Project = { _id: string; name: string };

function recognitionFileName(recognition: Recognition) {
  return `constancia-${recognition.folio}-${recognition.year}.pdf`;
}

function downloadBlob(url: string, fileName: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
}

function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join(', ');
  }
  return 'Ocurrió un error. Inténtalo nuevamente.';
}

export default function ConstanciasPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [refreshing, setRefreshing] = useState<Recognition | null>(null);
  const [userId, setUserId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [folio, setFolio] = useState('');
  const [preview, setPreview] = useState<Recognition | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const previewRequest = useRef<AbortController | null>(null);
  const recognitions = useQuery({
    queryKey: ['recognitions'],
    queryFn: async () => (await api.get<Recognition[]>('/documents')).data,
  });
  const teachers = useQuery({
    queryKey: ['recognition-teachers'],
    queryFn: async () => (await api.get<Teacher[]>('/documents/teachers')).data,
    enabled: open,
  });
  const projects = useQuery({
    queryKey: ['recognition-projects', userId],
    queryFn: async () => (await api.get<Project[]>('/documents/projects', { params: { userId } })).data,
    enabled: open && Boolean(userId),
  });
  const save = useMutation({
    mutationFn: async () => api.post('/documents', { userId, projectId, folio }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['recognitions'] });
      setOpen(false);
      toast.success('Constancia generada.');
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const refresh = useMutation({
    mutationFn: async (id: string) => api.post(`/documents/${id}/refresh`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['recognitions'] });
      setRefreshing(null);
      toast.success('Constancia actualizada.');
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  useEffect(() => () => {
    previewRequest.current?.abort();
  }, []);
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const showForm = () => {
    setUserId('');
    setProjectId('');
    setFolio('');
    setOpen(true);
  };
  const closePreview = () => {
    previewRequest.current?.abort();
    previewRequest.current = null;
    setPreview(null);
    setPreviewUrl(null);
    setPreviewError(null);
    setPreviewLoading(false);
  };
  const openPreview = async (recognition: Recognition) => {
    previewRequest.current?.abort();
    const request = new AbortController();
    previewRequest.current = request;
    setPreview(recognition);
    setPreviewUrl(null);
    setPreviewError(null);
    setPreviewLoading(true);
    try {
      const response = await api.get<Blob>(`/documents/${recognition._id}/file`, {
        responseType: 'blob',
        signal: request.signal,
      });
      if (request.signal.aborted) return;
      const url = URL.createObjectURL(response.data);
      setPreviewUrl(url);
    } catch (error) {
      if (!request.signal.aborted) {
        console.error('Failed to open recognition preview:', error);
        setPreviewError('No se pudo cargar la vista previa de la constancia.');
      }
    } finally {
      if (!request.signal.aborted) setPreviewLoading(false);
    }
  };
  const downloadFile = async (recognition: Recognition) => {
    try {
      const response = await api.get<Blob>(`/documents/${recognition._id}/file`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      downloadBlob(url, recognitionFileName(recognition));
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate();
  };

  const filters = useMemo<FacetedFilterConfig[]>(() => {
    const users = new Map<string, string>();
    const years = new Set<string>();
    for (const recognition of recognitions.data ?? []) {
      users.set(recognition.userId, `${recognition.userName} (${recognition.userEmail})`);
      years.add(String(recognition.year));
    }
    return [
      {
        columnId: 'user',
        title: 'Usuario',
        options: Array.from(users, ([value, label]) => ({ value, label }))
          .sort((a, b) => a.label.localeCompare(b.label, 'es')),
      },
      {
        columnId: 'year',
        title: 'Año',
        options: Array.from(years).sort().reverse().map((year) => ({ value: year, label: year })),
      },
    ];
  }, [recognitions.data]);

  const columns: ColumnDef<Recognition>[] = [
    {
      id: 'search',
      accessorFn: (row) => `${row.userName} ${row.userEmail} ${row.folio} ${row.folio}/${row.year}`,
      header: 'Buscar',
      filterFn: fuzzyFilter,
      meta: { className: 'hidden' },
    },
    {
      id: 'user',
      accessorFn: (row) => row.userId,
      header: 'Usuario',
      filterFn: facetedFilter,
      cell: ({ row }) => {
        const recognition = row.original;
        return <ProfileInfo size="sm" givenName={recognition.userName} email={recognition.userEmail} avatarUrl={recognition.userAvatarUrl} />;
      },
    },
    {
      accessorKey: 'issuedAt',
      header: 'Fecha de emisión',
      cell: ({ row }) => new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeZone: 'America/Mexico_City' }).format(new Date(row.original.issuedAt)),
    },
    {
      id: 'year',
      accessorFn: (row) => String(row.year),
      header: 'Folio',
      filterFn: facetedFilter,
      cell: ({ row }) => `${row.original.folio}/${row.original.year}`,
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const recognition = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Acciones de constancia"><MoreHorizontal /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => void openPreview(recognition)}><Eye /> Ver archivo</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void downloadFile(recognition)}><Download /> Descargar archivo</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setRefreshing(recognition)}><RefreshCw /> Actualizar constancia</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="w-full min-h-screen">
      <Header>
        <HeaderHeading><HeaderTitle>Constancias generadas</HeaderTitle></HeaderHeading>
        <HeaderAction>
          <Button onClick={() => showForm()}><Plus /> Crear constancia</Button>
        </HeaderAction>
      </Header>
      <PageContent>
        {recognitions.isLoading ? <p>Cargando constancias...</p> : recognitions.isError ? (
          <p role="alert">No se pudieron cargar las constancias.</p>
        ) : (
          <div className="max-w-7xl w-full p-1">
            <DataTable
              data={recognitions.data ?? []}
              columns={columns}
              facetedFilters={filters}
              searchColumnId="search"
              dateSortFields={['issuedAt']}
              persistStateKey="recognitions-table"
            />
          </div>
        )}
      </PageContent>
      <FilePreviewDialog
        open={Boolean(preview)}
        onOpenChange={(isOpen) => { if (!isOpen) closePreview(); }}
        fileName={preview ? recognitionFileName(preview) : 'Constancia'}
        mimeType="application/pdf"
        previewBlobUrl={previewUrl}
        isLoading={previewLoading}
        errorMessage={previewError}
        onRetry={() => { if (preview) void openPreview(preview); }}
        onDownload={() => { if (preview && previewUrl) downloadBlob(previewUrl, recognitionFileName(preview)); }}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="grid-cols-1">
          <DialogHeader>
            <DialogTitle>Crear constancia</DialogTitle>
            <DialogDescription>Selecciona un docente, un proyecto elegible y escribe el folio.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="min-w-0 w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recognition-user">Usuario</Label>
              <Select value={userId} onValueChange={(value) => { setUserId(value); setProjectId(''); }}>
                <SelectTrigger id="recognition-user" className="w-full min-w-0 max-w-full [&>span]:block [&>span]:min-w-0 [&>span]:truncate"><SelectValue placeholder="Selecciona un docente" /></SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)] max-w-[var(--radix-popper-available-width)]">{teachers.data?.map((teacher) => (
                  <SelectItem key={teacher._id} value={teacher._id} className="min-w-0 [&>span:last-child]:min-w-0 [&>span:last-child]:w-full"><span className="block truncate" title={`${teacher.givenName} ${teacher.familyName} (${teacher.email})`}>{teacher.givenName} {teacher.familyName} ({teacher.email})</span></SelectItem>
                ))}</SelectContent>
              </Select>
              {teachers.isError && <p role="alert">No se pudieron cargar los docentes.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="recognition-project">Proyecto</Label>
              <Select value={projectId} onValueChange={setProjectId} disabled={!userId || projects.isLoading}>
                <SelectTrigger id="recognition-project" className="w-full min-w-0 max-w-full [&>span]:block [&>span]:min-w-0 [&>span]:truncate"><SelectValue placeholder="Selecciona un proyecto" /></SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)] max-w-[var(--radix-popper-available-width)]">{projects.data?.map((project) => <SelectItem key={project._id} value={project._id} className="min-w-0 [&>span:last-child]:min-w-0 [&>span:last-child]:w-full"><span className="block truncate" title={project.name}>{project.name}</span></SelectItem>)}</SelectContent>
              </Select>
              {projects.isError && <p role="alert">No se pudieron cargar los proyectos.</p>}
              {userId && projects.data?.length === 0 && <p>No hay proyectos elegibles para este docente.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="recognition-folio">Folio</Label>
              <Input id="recognition-folio" value={folio} onChange={(event) => setFolio(event.target.value)} required maxLength={40} pattern="[A-Za-z0-9-]+" />
            </div>
            <DialogFooter><Button type="submit" disabled={!userId || !projectId || !folio || save.isPending}>{save.isPending ? 'Guardando...' : 'Guardar constancia'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(refreshing)} onOpenChange={(isOpen) => { if (!isOpen && !refresh.isPending) setRefreshing(null); }}>
        <DialogContent showCloseButton={!refresh.isPending}>
          <DialogHeader>
            <DialogTitle>Actualizar constancia</DialogTitle>
            <DialogDescription>
              Se reemplazará el archivo con la información actual del proyecto, conservando el usuario, el folio y la fecha de emisión.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={refresh.isPending} onClick={() => setRefreshing(null)}>Cancelar</Button>
            <Button type="button" disabled={refresh.isPending} onClick={() => { if (refreshing) refresh.mutate(refreshing._id); }}>
              {refresh.isPending ? 'Actualizando...' : 'Actualizar constancia'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
