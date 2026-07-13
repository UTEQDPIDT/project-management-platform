import { IProject, ProjectStatus, SeedCategory,EntityType,FilePurpose,IFile,UserRole } from '@repo/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowUp10,
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  Building,
  Calendar,
  Folder,
  FoldVertical,
  LandPlot,
  Leaf,
  MapPinned,
  MoveRight,
  Percent,
  Target,
  Upload,
  User,
  UserCircle,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { ProfileInfo } from './profile-info';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { concatWithCommaAndDot, getBaseUrlBasedOnRole } from '@/lib/utils';
import { useUserProfile } from 'context/profile-provider';

import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from './ui/file-upload';
import FileButton from './file-button';
import  CopyButton  from './ui/copy';
import { useFilesForEntity, useUploadMultipleFiles } from '@/hooks/files';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

interface ProjectInfoProps {
  project: IProject;
  progress: number;
}

export function ProjectInfo({ project, progress }: ProjectInfoProps) {
  const { user } = useUserProfile();
  const baseUrl = getBaseUrlBasedOnRole(user.role);

  const isOwner =
    user?._id && project?.owner?._id && user._id === project.owner._id;
  const canManageFinancialReport =
    user?.role === UserRole.ADMIN || Boolean(isOwner);

  const { data: files = [], isLoading, isError } = useFilesForEntity(project._id);
  const uploadFiles = useUploadMultipleFiles();
    
  const financialReport = files.find(
    (file: IFile) => file.purpose === FilePurpose.PROJECT_FINANCIAL_REPORT,
  );

  const [financialReportToUpload, setFinancialReportToUpload] = useState<
      File[]
    >([]);

    // Validation for financial report upload
    const onFinancialFileValidate = useCallback(
      (file: File): string | null => {
        if (financialReport) {
          return 'Sólo puedes subir un archivo';
        }
        if (!file.type.endsWith('pdf')) {
          return 'Solo se aceptan PDFs';
        }
        const MAX_SIZE = 2 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
          return `El peso del archivo no debe exceder ${MAX_SIZE / (1024 * 1024)}MB`;
        }
        return null;
      },
      [financialReport],
    );

    const onFileReject = useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" fue rechazado`,
    });
  }, []);

    const handleFinancialReportUpload = () => {
      if (!financialReportToUpload.length) {
        toast.error('Selecciona un PDF antes de subirlo');
        return;
      }

      uploadFiles.mutate({
        files: financialReportToUpload,
        entityId: project._id,
        entityType: EntityType.PROJECT,
        purpose: FilePurpose.PROJECT_FINANCIAL_REPORT,
      });
  
      setFinancialReportToUpload([]);
    };

    
  const normalizeProjectStatus = (value?: string): ProjectStatus => {
    const normalizedValue = (value ?? '').trim().toUpperCase();

    if (
      normalizedValue === 'IN_PROGRESS' ||
      normalizedValue === 'EN PROGRESO' ||
      normalizedValue === 'PROGRESS'
    ) {
      return ProjectStatus.IN_PROGRESS;
    }

    if (
      normalizedValue === 'COMPLETED' ||
      normalizedValue === 'COMPLETADO'
    ) {
      return ProjectStatus.COMPLETED;
    }

    return ProjectStatus.PENDING;
  };

  const getProjectStatusLabel = (value?: string) => {
    const normalizedStatus = normalizeProjectStatus(value);

    if (normalizedStatus === ProjectStatus.PENDING) {
      if (progress >= 100) return 'Completado';
      if (progress > 0) return 'En progreso';
    }

    if (normalizedStatus === ProjectStatus.IN_PROGRESS) return 'En progreso';
    if (normalizedStatus === ProjectStatus.COMPLETED) return 'Completado';
    return 'Pendiente';
  };

  const {
    name,
    startDate,
    endDate,
    trlRating,
    team,
    owner,
    organization,
    objective,
    program,
    updatedAt,
    createdAt,
    updatedBy,
    impactLevel,
    impactAreas,
    knowledgeAreas,
    sustainableObjectives,
    prioritiesPND,
    innovationLines,
    relatedProjects,
    status,
    isFunded,
  } = project;

  // Clase reutilizable para cada fila de datos del proyecto
  const rowClass = "flex flex-col sm:flex-row sm:items-start py-1 sm:py-0 border-b border-neutral-100 sm:border-0";
  // Clase reutilizable para el label de la izquierda
  const labelClass = "p-2 flex gap-2 text-muted-foreground w-full sm:w-40 items-center font-medium sm:font-normal rounded-md shrink-0";

  return (
    <div className="text-sm border-b pb-4 w-full px-2 sm:px-4 space-y-1">
      <div className="pb-2">
        <h1 className="text-xl font-semibold">{name}</h1>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Building size={14} /> Organización
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">
          {organization ? (
            <span>{organization}</span>
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Percent size={14} /> Progreso
        </span>
        <div className="p-2 hover:bg-secondary rounded-md flex gap-2 w-full max-w-48 items-center">
          <Progress value={progress} />
          <div className="flex text-xs">
            <span>{progress}</span>
            <span>%</span>
          </div>
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Target size={14} /> Estado
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">
          <span>{getProjectStatusLabel(status)}</span>
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Calendar size={14} /> Periodo
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">
          {startDate && (
            <div className="flex flex-wrap gap-1 sm:gap-2 items-center">
              <span>
                {format(startDate, "d 'de' MMMM 'de' yyyy", {
                  locale: es,
                })}
              </span>
              {endDate && (
                <span className="flex gap-1 sm:gap-2 items-center text-muted-foreground flex-wrap">
                  <MoveRight size={12} className="hidden sm:inline" />
                  <span className="sm:hidden text-xs font-bold px-1">al</span>
                  {format(endDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Folder size={14} /> Programa
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">
          {program ? (
            <span>{program.name}</span>
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>
    
    {isFunded && (user.role === UserRole.ADMIN || isOwner) && (
      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <Folder size={14} /> Reporte financiero
        </span>
        <div className="p-2 hover:bg-secondary rounded-md">
              {financialReport ? (
                <FileButton
                  canDelete={canManageFinancialReport}
                  file={financialReport}
                  className="max-w-52"
                />
              ) : canManageFinancialReport ? (
                <Dialog>
                  <DialogTrigger className="border h-7 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5">
                    <Upload />
                    Subir Informe
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>Informe Financiero del Evento</DialogTitle>

                    <FileUpload
                      value={financialReportToUpload}
                      onValueChange={setFinancialReportToUpload}
                      onFileValidate={onFinancialFileValidate}
                      onFileReject={onFileReject}
                      accept="application/pdf"
                      maxFiles={1}
                    >
                      <FileUploadDropzone>
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center justify-center rounded-full border p-2.5">
                            <Upload className="size-6 text-muted-foreground" />
                          </div>
                          <p className="font-medium text-sm">
                            Arrastra el archivo aquí
                          </p>
                          <p className="text-muted-foreground text-xs">
                            o haz click para buscar (max 2 MB)
                          </p>
                        </div>
                        <FileUploadTrigger asChild>
                          <Button size="sm" variant="outline">
                            Buscar
                          </Button>
                        </FileUploadTrigger>
                      </FileUploadDropzone>

                      <FileUploadList className='max-w-115'>
                        {financialReportToUpload.map((file, index) => (
                          <FileUploadItem
                            key={`${file.name}-${file.lastModified}-${index}`}
                            value={file}
                          >
                            <FileUploadItemPreview />
                            <FileUploadItemMetadata />
                            <FileUploadItemDelete asChild>
                              <Button variant="ghost" size="icon-xs">
                                <X />
                              </Button>
                            </FileUploadItemDelete>
                          </FileUploadItem>
                        ))}
                      </FileUploadList>
                    </FileUpload>

                    <div className="flex gap-2">
                      <DialogClose asChild>
                        <Button variant="outline">Cerrar</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button onClick={handleFinancialReportUpload}>
                          Subir Informe
                        </Button>
                      </DialogClose>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Sin informe financiero
                </span>
              )}
            </div>
      </div>
    )}

      <div className={rowClass}>
        <span className={labelClass}>
          <ArrowUp10 size={14} /> Nivel de TRL
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">{trlRating}</div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Target size={14} /> Objetivo
        </span>
        <div className="p-2 lg:max-w-4xl text-pretty hover:bg-secondary rounded-md w-full">
          {objective ? objective : <span className="text-gray-400">Vacío</span>}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <MapPinned size={14} /> Nivel de impacto
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">{impactLevel}</div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <BookOpen size={14} className="shrink-0" /> Áreas de Conocimiento
        </span>
        <div className="p-2 hover:bg-secondary rounded-md lg:max-w-4xl text-pretty w-full">
          {knowledgeAreas?.length ? (
            <span>
              {concatWithCommaAndDot(
                knowledgeAreas.map((a: SeedCategory) => a.name),
              )}
            </span>
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <FoldVertical size={14} className="shrink-0" /> Impactos Transversales
        </span>
        <div className="p-2 hover:bg-secondary rounded-md lg:max-w-4xl text-pretty w-full">
          {impactAreas?.length ? (
            <span>
              {concatWithCommaAndDot(
                impactAreas.map((a: SeedCategory) => a.name),
              )}
            </span>
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Leaf size={14} className="shrink-0" /> Objetivos Sustentables
        </span>
        <div className="p-2 hover:bg-secondary rounded-md lg:max-w-4xl text-pretty w-full">
          {sustainableObjectives?.length ? (
            <span>
              {concatWithCommaAndDot(
                sustainableObjectives.map((o: SeedCategory) => o.name),
              )}
            </span>
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <LandPlot size={14} className="shrink-0" />
          Prioridades PND
        </span>
        <div className="p-2 hover:bg-secondary rounded-md lg:max-w-4xl text-pretty w-full">
          {prioritiesPND?.length ? (
            <span>
              {concatWithCommaAndDot(
                prioritiesPND.map((p: SeedCategory) => p.name),
              )}
            </span>
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <BrainCircuit size={14} className="shrink-0" />
          LIIADTs
        </span>
        <div className="p-2 hover:bg-secondary rounded-md lg:max-w-4xl text-pretty w-full">
          {innovationLines?.length ? (
            <span>
              {concatWithCommaAndDot(
                innovationLines.map((l: SeedCategory) => l.name),
              )}
            </span>
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Users size={14} /> Equipo
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full flex flex-wrap">
          {team ? (
            <Button size="xs" asChild variant="ghost" className="h-auto py-1 px-2 text-left justify-start whitespace-normal">
              <Link href={`${baseUrl}/equipos/${team._id}`}>
                {team.teamName}
                <ArrowUpRight />
              </Link>
            </Button>
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Folder size={14} /> Proyectos
        </span>
        {/* CORRECCIÓN AQUÍ: flex flex-wrap gap-1 */}
        <div className="p-2 hover:bg-secondary rounded-md w-full flex flex-wrap gap-1">
          {relatedProjects?.length ? (
            relatedProjects.map((p: IProject) => (
              <Button key={p._id} size="xs" asChild variant="ghost" className="h-auto py-1 px-2 text-left justify-start whitespace-normal">
                <Link href={`${baseUrl}/proyectos/${p._id}`}>
                  {p.name}
                  <ArrowUpRight />
                </Link>
              </Button>
            ))
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <UserCircle size={14} /> Creado por
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">
          {owner ? (
            <ProfileInfo
              size="sm"
              givenName={owner.givenName}
              familyName={owner.familyName}
              avatarUrl={owner.avatarUrl}
            />
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Calendar size={14} /> Creado el
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">
          {format(createdAt, "d 'de' MMMM 'de' yyyy k':'mm", {
            locale: es,
          })}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <UserCircle size={14} /> Modificado por
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">
          {updatedBy && (
            <ProfileInfo
              size="sm"
              givenName={updatedBy.givenName}
              familyName={updatedBy.familyName}
              avatarUrl={updatedBy.avatarUrl}
            />
          )}
        </div>
      </div>

      <div className={rowClass}>
        <span className={labelClass}>
          <Calendar size={14} /> Modificado el
        </span>
        <div className="p-2 hover:bg-secondary rounded-md w-full">
          {format(updatedAt, "d 'de' MMMM 'de' yyyy k':'mm", {
            locale: es,
          })}
        </div>
      </div>
    </div>
  );
}