'use client';

import { useFilesForEntity, useUploadMultipleFiles } from '@/hooks/files';
import { EntityType, FilePurpose, IEvent, IFile, UserRole } from '@repo/types';
import { useUserProfile } from 'context/profile-provider';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Building,
  Calendar,
  Clock,
  FileText,
  Info,
  MapPin,
  Upload,
  UserCircle,
  X,
} from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
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
import { ProfileInfo } from './profile-info';
import CopyButton from './ui/copy';

type EventInfoProps = {
  event: IEvent;
};

export function EventInfo({ event }: EventInfoProps) {
  const { user } = useUserProfile();

  const { data: files = [], isLoading, isError } = useFilesForEntity(event._id);
  const uploadFiles = useUploadMultipleFiles();

  // Filter files for technical and financial reports
  const technicalReport = files.find(
    (file: IFile) => file.purpose === FilePurpose.EVENT_TECHNICAL_REPORT,
  );
  const financialReport = files.find(
    (file: IFile) => file.purpose === FilePurpose.EVENT_FINANCIAL_REPORT,
  );

  // Handle file upload state
  const [technicalReportToUpload, setTechnicalReportToUpload] = useState<
    File[]
  >([]);
  const [financialReportToUpload, setFinancialReportToUpload] = useState<
    File[]
  >([]);

  // Validation for technical report upload
  const onTechnicalFileValidate = useCallback(
    (file: File): string | null => {
      if (technicalReport) {
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
    [technicalReport],
  );

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

  const handleTechnicalReportUpload = () => {
    uploadFiles.mutate({
      files: technicalReportToUpload,
      entityId: event._id,
      entityType: EntityType.EVENT,
      purpose: FilePurpose.EVENT_TECHNICAL_REPORT,
    });

    setTechnicalReportToUpload([]);
  };

  const handleFinancialReportUpload = () => {
    uploadFiles.mutate({
      files: financialReportToUpload,
      entityId: event._id,
      entityType: EntityType.EVENT,
      purpose: FilePurpose.EVENT_FINANCIAL_REPORT,
    });

    setFinancialReportToUpload([]);
  };

  return (
    <div className="text-sm border-b pb-4 w-full px-4">
      <div className="pb-2">
        <h1 className="text-xl font-semibold">{event.name}</h1>
      </div>

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <Building size={14} /> Organización
        </span>

        <div className="p-2 lg:max-w-4xl text-pretty hover:bg-secondary rounded-md">
          {event.organization ? (
            event.organization
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <Info size={14} /> Acerca del Evento
        </span>

        <div className="p-2 lg:max-w-4xl text-pretty hover:bg-secondary rounded-md">
          {event.summary ? (
            event.summary
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <MapPin size={14} /> Ubicación
        </span>

        <div className="p-2 lg:max-w-4xl text-pretty hover:bg-secondary rounded-md">
          {event.location ? (
            <div className="relative flex items-center group">
              <span>{event.location}</span>
              <CopyButton
                valueToCopy={event.location}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          ) : (
            <span className="text-gray-400">Vacío</span>
          )}
        </div>
      </div>

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <Calendar size={14} /> Fecha
        </span>
        <div className="p-2 hover:bg-secondary rounded-md">
          {event.endDate ? (
            <div>
              {format(event.startDate, "d 'de' MMMM 'al' ", {
                locale: es,
              })}
              {format(event.endDate, "d 'de' MMMM 'del' yyyy", {
                locale: es,
              })}
            </div>
          ) : (
            <div>
              {format(event.startDate, "d',' MMM 'del' yyyy", {
                locale: es,
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start">
        <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
          <UserCircle size={14} /> Asistencia
        </span>

        <div className="p-2 hover:bg-secondary rounded-md grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-lg font-semibold">
              {event.attendance?.totalParticipants ?? 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Hombres</p>
            <p className="text-lg font-semibold">{event.attendance?.men ?? 0}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Mujeres</p>
            <p className="text-lg font-semibold">{event.attendance?.women ?? 0}</p>
          </div>
        </div>
      </div>

      {user.role === UserRole.ADMIN && (
        <div>
          <div className="flex items-start">
            <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
              <FileText size={14} /> Informe Técnico
            </span>
            <div className="p-2 hover:bg-secondary rounded-md">
              {technicalReport ? (
                <FileButton
                  canDelete
                  file={technicalReport}
                  className="max-w-52"
                />
              ) : (
                <Dialog>
                  <DialogTrigger className="border h-7 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5">
                    <Upload />
                    Subir Informe
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>Informe Técnico del Evento</DialogTitle>

                    <FileUpload
                      value={technicalReportToUpload}
                      onValueChange={setTechnicalReportToUpload}
                      onFileValidate={onTechnicalFileValidate}
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
                        <FileUploadTrigger>
                          <Button size="sm" variant="outline">
                            Buscar
                          </Button>
                        </FileUploadTrigger>
                      </FileUploadDropzone>

                      <FileUploadList className='max-w-115'>
                        {technicalReportToUpload.map((file, index) => (
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
                        <Button onClick={handleTechnicalReportUpload}>
                          Subir Informe
                        </Button>
                      </DialogClose>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
              <FileText size={14} /> Informe Financiero
            </span>
            <div className="p-2 hover:bg-secondary rounded-md">
              {financialReport ? (
                <FileButton
                  canDelete
                  file={financialReport}
                  className="max-w-52"
                />
              ) : (
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
                        <FileUploadTrigger>
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
              )}
            </div>
          </div>

          <div className="flex items-start">
            <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
              <Clock size={14} /> Creado el
            </span>
            <div className="p-2 hover:bg-secondary rounded-md">
              {format(event.createdAt, "d 'de' MMMM 'de' yyyy k':'mm", {
                locale: es,
              })}
            </div>
          </div>

          <div className="flex items-start">
            <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
              <UserCircle size={14} /> Creado por
            </span>
            <div className="p-2 hover:bg-secondary rounded-md">
              {event.createdBy ? (
                <ProfileInfo
                  givenName={event.createdBy.givenName}
                  familyName={event.createdBy.familyName}
                  avatarUrl={event.createdBy.avatarUrl}
                  size="sm"
                />
              ) : '—'}
            </div>
          </div>

          <div className="flex items-start">
            <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
              <Clock size={14} /> Modificado el
            </span>
            <div className="p-2 hover:bg-secondary rounded-md">
              {format(event.updatedAt, "d 'de' MMMM 'de' yyyy k':'mm", {
                locale: es,
              })}
            </div>
          </div>
          <div className="flex items-start">
            <span className="p-2 flex gap-2 text-muted-foreground w-40 items-center rounded-md">
              <UserCircle size={14} /> Modificado por
            </span>
            <div className="p-2 hover:bg-secondary rounded-md">
              {event.updatedBy ? (
                <ProfileInfo
                  givenName={event.updatedBy.givenName}
                  familyName={event.updatedBy.familyName}
                  avatarUrl={event.updatedBy.avatarUrl}
                  size="sm"
                />
              ) : '—'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
