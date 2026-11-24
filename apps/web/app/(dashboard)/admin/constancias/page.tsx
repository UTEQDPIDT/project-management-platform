'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import axios from 'axios';
import { Download, Eye, MoreHorizontal, Plus, RefreshCw, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import { Header, HeaderAction, HeaderHeading, HeaderTitle } from '@/components/header';
import { PageContent } from '@/components/page-content';
import { ProfileInfo } from '@/components/profile-info';
import FilePreviewDialog from '@/components/file-preview-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  recognitionType?: 'constancia' | 'recomendacion';
};
type Teacher = { _id: string; givenName: string; familyName: string; email: string };
type Project = { _id: string; name: string };

function recognitionFileName(recognition: Recognition) {
  return `${recognition.recognitionType || 'constancia'}-${recognition.folio}-${recognition.year}.pdf`;
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
  const [recognitionType, setRecognitionType] = useState('constancia');
  const [customUserName, setCustomUserName] = useState('');
  const [useCustomUserName, setUseCustomUserName] = useState(false);
  const [customHours, setCustomHours] = useState('1');
  const [useCustomHours, setUseCustomHours] = useState(false);
  const [preview, setPreview] = useState<Recognition | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Recognition | null>(null);
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
    mutationFn: async () => api.post('/documents', {
      userId,
      projectId,
      folio,
      recognitionType,
      customUserName: useCustomUserName ? customUserName : undefined,
      customHours: useCustomHours && recognitionType === 'recomendacion' ? parseInt(customHours, 10) : undefined,
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['recognitions'] });
      setOpen(false);
      toast.success('Documento generado.');
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const refresh = useMutation({
    mutationFn: async (id: string) => api.post(`/documents/${id}/refresh`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['recognitions'] });
      setRefreshing(null);
      toast.success('Documento actualizado.');
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const delete_ = useMutation({
    mutationFn: async (id: string) => api.delete(`/documents/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['recognitions'] });
      toast.success('Documento eliminado.');
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const update = useMutation({
    mutationFn: async (id: string) => api.patch(`/documents/${id}`, {
      folio,
      recognitionType,
      customUserName: useCustomUserName ? customUserName : undefined,
      customHours: useCustomHours && recognitionType === 'recomendacion' ? parseInt(customHours, 10) : undefined,
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['recognitions'] });
      setEditing(null);
      toast.success('Documento actualizado.');
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
    setRecognitionType('constancia');
    setCustomUserName('');
    setUseCustomUserName(false);
    setCustomHours('1');
    setUseCustomHours(false);
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
  const openEdit = (recognition: Recognition) => {
    setFolio(recognition.folio);
    setRecognitionType(recognition.recognitionType || 'constancia');
    setCustomUserName('');
    setUseCustomUserName(false);
    setCustomHours('1');
    setUseCustomHours(false);
    setEditing(recognition);
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
        setPreviewError('No se pudo cargar la vista previa del documento.');
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
  const submitEdit = (event: FormEvent) => {
    event.preventDefault();
    if (editing) update.mutate(editing._id);
  };

  const filters = useMemo<FacetedFilterConfig[]>(() => {
    const users = new Map<string, string>();
    const years = new Set<string>();
    const types = new Set<string>();
    for (const recognition of recognitions.data ?? []) {
      users.set(recognition.userId, `${recognition.userName} (${recognition.userEmail})`);
      years.add(String(recognition.year));
      if (recognition.recognitionType) types.add(recognition.recognitionType);
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
      {
        columnId: 'recognitionType',
        title: 'Tipo',
        options: Array.from(types).map((type) => ({
          value: type,
          label: type === 'constancia' ? 'Constancia' : 'Recomendación',
        })),
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
      id: 'recognitionType',
      accessorFn: (row) => row.recognitionType || 'constancia',
      header: 'Tipo',
      filterFn: facetedFilter,
      cell: ({ row }) => {
        const type = row.original.recognitionType || 'constancia';
        return type === 'constancia' ? 'Constancia' : 'Recomendación';
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const recognition = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Acciones del documento"><MoreHorizontal /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => void openPreview(recognition)}><Eye /> Ver archivo</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void downloadFile(recognition)}><Download /> Descargar archivo</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setRefreshing(recognition)}><RefreshCw /> Actualizar documento</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openEdit(recognition)}><Edit /> Modificar datos</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => delete_.mutate(recognition._id)} variant="destructive"><Trash2 /> Eliminar constancia</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="w-full min-h-screen">
      <Header>
        <HeaderHeading><HeaderTitle>Documentos generados</HeaderTitle></HeaderHeading>
        <HeaderAction>
          <Button onClick={() => showForm()}><Plus /> Crear documento</Button>
        </HeaderAction>
      </Header>
      <PageContent>
        {recognitions.isLoading ? <p>Cargando documentos...</p> : recognitions.isError ? (
          <p role="alert">No se pudieron cargar los documentos.</p>
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
        fileName={preview ? recognitionFileName(preview) : 'Documento'}
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
            <DialogTitle>Crear documento</DialogTitle>
            <DialogDescription>Selecciona un docente, un proyecto elegible, el tipo de documento y escribe el folio.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="min-w-0 w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recognition-type">Tipo de documento</Label>
              <Select value={recognitionType} onValueChange={setRecognitionType}>
                <SelectTrigger id="recognition-type" className="w-full min-w-0 max-w-full [&>span]:block [&>span]:min-w-0 [&>span]:truncate"><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)] max-w-[var(--radix-popper-available-width)]">
                  <SelectItem value="constancia">Constancia</SelectItem>
                  <SelectItem value="recomendacion">Recomendación de horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-2">
                <Checkbox id="use-custom-name" checked={useCustomUserName} onCheckedChange={(checked) => setUseCustomUserName(Boolean(checked))} />
                <Label htmlFor="use-custom-name" className="cursor-pointer font-normal">Agregar nombre del docente manualmente</Label>
              </div>
              {useCustomUserName && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="custom-name">Nombre del docente</Label>
                  <Input id="custom-name" value={customUserName} onChange={(e) => setCustomUserName(e.target.value)} placeholder="Nombre completo" maxLength={200} />
                </div>
              )}
            </div>
            {recognitionType === 'recomendacion' && (
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="use-custom-hours" checked={useCustomHours} onCheckedChange={(checked) => setUseCustomHours(Boolean(checked))} />
                  <Label htmlFor="use-custom-hours" className="cursor-pointer font-normal">Agregar horas manualmente</Label>
                </div>
                {useCustomHours && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="custom-hours">Horas de desarrollo del proyecto</Label>
                    <Select value={customHours} onValueChange={setCustomHours}>
                      <SelectTrigger id="custom-hours" className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                          <SelectItem key={hour} value={String(hour)}>{hour} {hour === 1 ? 'hora' : 'horas'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="recognition-folio">Folio</Label>
              <Input id="recognition-folio" value={folio} onChange={(event) => setFolio(event.target.value)} required maxLength={40} pattern="[A-Za-z0-9-]+" />
            </div>
            <DialogFooter><Button type="submit" disabled={!userId || !projectId || !folio || save.isPending}>{save.isPending ? 'Guardando...' : 'Guardar documento'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(refreshing)} onOpenChange={(isOpen) => { if (!isOpen && !refresh.isPending) setRefreshing(null); }}>
        <DialogContent showCloseButton={!refresh.isPending}>
          <DialogHeader>
            <DialogTitle>Actualizar documento</DialogTitle>
            <DialogDescription>
              Se reemplazará el archivo con la información actual del proyecto, conservando el usuario, el folio y la fecha de emisión.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={refresh.isPending} onClick={() => setRefreshing(null)}>Cancelar</Button>
            <Button type="button" disabled={refresh.isPending} onClick={() => { if (refreshing) refresh.mutate(refreshing._id); }}>
              {refresh.isPending ? 'Actualizando...' : 'Actualizar documento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(editing)} onOpenChange={(isOpen) => { if (!isOpen && !update.isPending) setEditing(null); }}>
        <DialogContent className="grid-cols-1">
          <DialogHeader>
            <DialogTitle>Modificar datos</DialogTitle>
            <DialogDescription>Puedes cambiar el tipo de documento, el folio y las opciones personalizadas.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitEdit} className="min-w-0 w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-recognition-type">Tipo de documento</Label>
              <Select value={recognitionType} onValueChange={setRecognitionType}>
                <SelectTrigger id="edit-recognition-type" className="w-full min-w-0 max-w-full [&>span]:block [&>span]:min-w-0 [&>span]:truncate"><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)] max-w-[var(--radix-popper-available-width)]">
                  <SelectItem value="constancia">Constancia</SelectItem>
                  <SelectItem value="recomendacion">Recomendación de horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-2">
                <Checkbox id="edit-use-custom-name" checked={useCustomUserName} onCheckedChange={(checked) => setUseCustomUserName(Boolean(checked))} />
                <Label htmlFor="edit-use-custom-name" className="cursor-pointer font-normal">Agregar nombre del docente manualmente</Label>
              </div>
              {useCustomUserName && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="edit-custom-name">Nombre del docente</Label>
                  <Input id="edit-custom-name" value={customUserName} onChange={(e) => setCustomUserName(e.target.value)} placeholder="Nombre completo" maxLength={200} />
                </div>
              )}
            </div>
            {recognitionType === 'recomendacion' && (
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="edit-use-custom-hours" checked={useCustomHours} onCheckedChange={(checked) => setUseCustomHours(Boolean(checked))} />
                  <Label htmlFor="edit-use-custom-hours" className="cursor-pointer font-normal">Agregar horas manualmente</Label>
                </div>
                {useCustomHours && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="edit-custom-hours">Horas de desarrollo del proyecto</Label>
                    <Select value={customHours} onValueChange={setCustomHours}>
                      <SelectTrigger id="edit-custom-hours" className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                          <SelectItem key={hour} value={String(hour)}>{hour} {hour === 1 ? 'hora' : 'horas'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="edit-recognition-folio">Folio</Label>
              <Input id="edit-recognition-folio" value={folio} onChange={(event) => setFolio(event.target.value)} required maxLength={40} pattern="[A-Za-z0-9-]+" />
            </div>
            <DialogFooter><Button type="submit" disabled={!folio || update.isPending}>{update.isPending ? 'Guardando...' : 'Guardar cambios'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
