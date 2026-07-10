'use client';

import { cn, formatFileSize, trimFileNameMiddle } from '@/lib/utils';
import { getFileBlobUrl } from '@/services/files.service';
import { IFile, UserRole } from '@repo/types';
import {
  Download,
  Eye,
  FileText,
  Image,
  MoreHorizontal,
  Trash,
} from 'lucide-react';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

import { IUser } from '@repo/types';
import { useUserProfile } from 'context/profile-provider';

type FileContextValue = {
  onDelete?: (fileId: string) => void;
  onDownload?: (fileId: string) => void;
  currentUser: IUser;
  isAdmin: boolean;
};

const FileContext = createContext<FileContextValue | null>(null);

export const useFileContext = () => {
  const ctx = useContext(FileContext);
  if (!ctx) throw new Error('File components must be used inside <FileList/>');
  return ctx;
};

type FileListProps = PropsWithChildren & {
  onDelete?: (fileId: string) => void;
  onDownload?: (fileId: string) => void;
  isAdmin?: boolean;
  className?: string;
  files?: IFile[];
};

export default function FileList({
  children,
  className,
  isAdmin,
  files,
  ...handlers
}: FileListProps) {
  const { user: currentUser } = useUserProfile();

  return (
    <FileContext.Provider
      value={{
        ...handlers,
        currentUser,
        isAdmin: currentUser?.role === UserRole.ADMIN,
      }}
    >
      <ul className={cn('space-y-2', className)}>{children}</ul>
    </FileContext.Provider>
  );
}

type FileListItemProps = PropsWithChildren & {
  file: IFile;
  className?: string;
};

FileList.Item = function FileListItem({
  children,
  file,
  className,
}: FileListItemProps) {
  const handleFileIcon = () => {
    if (file.mimetype === 'application/pdf') return <FileText />;
    if (
      file.mimetype &&
      file.mimetype.startsWith &&
      file.mimetype.startsWith('image/')
    )
      return <Image />;
    return <FileText />;
  };

  return (
    <li
      className={cn(
        "flex items-center gap-2 w-full justify-between border p-2 bg-card rounded-lg text-card-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
    >
      <div className="flex gap-2 items-center">
        {handleFileIcon()}
        <div className="flex flex-col gap-1">
          <span className="text-sm">
            {trimFileNameMiddle(file.originalName, 30)}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </span>
        </div>
      </div>
      <div>{children}</div>
    </li>
  );
};

FileList.Actions = function FileActions({ file }: { file: IFile }) {
  const { onDelete, onDownload, currentUser, isAdmin } = useFileContext();
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  const canDelete: boolean =
    isAdmin ||
    (currentUser && file.owner && currentUser._id === file.owner._id);
  const isPdf = file.mimetype === 'application/pdf';

  const handleOpenPdf = async () => {
    if (!isPdf) return;

    try {
      setIsLoadingPdf(true);
      const blobUrl = await getFileBlobUrl(file._id);
      setPdfBlobUrl(blobUrl);
      setIsViewerOpen(true);
    } catch (error) {
      console.error('Failed to open PDF preview:', error);
    } finally {
      setIsLoadingPdf(false);
    }
  };

  useEffect(() => {
    if (isViewerOpen) return;

    if (pdfBlobUrl) {
      window.URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }
  }, [isViewerOpen, pdfBlobUrl]);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        window.URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-xs" variant="ghost">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="flex flex-col gap-1">
          {isPdf && (
            <DropdownMenuItem onClick={handleOpenPdf} disabled={isLoadingPdf}>
              <Eye /> {isLoadingPdf ? 'Abriendo PDF...' : 'Ver PDF'}
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => onDownload?.(file._id)}>
            <Download /> Descargar archivo
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            onClick={() => (canDelete ? onDelete?.(file._id) : undefined)}
            disabled={!canDelete}
          >
            <Trash /> Eliminar archivo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent
          className="flex h-[92dvh] w-[96vw] max-w-[96vw] flex-col p-2 sm:h-[88dvh] sm:w-[88vw] sm:max-w-[88vw] sm:p-4 lg:h-[80dvh] lg:w-[78vw] lg:max-w-[78vw]"
          showCloseButton
          closeButtonClassName="top-2 right-2 sm:top-4 sm:right-4 bg-background/80"
        >
          <DialogHeader className="px-1">
            <DialogTitle className="truncate">{file.originalName}</DialogTitle>
            <DialogDescription>Vista previa nativa de PDF</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1">
            {pdfBlobUrl ? (
              <iframe
                src={pdfBlobUrl}
                title={`Vista previa de ${file.originalName}`}
                className="h-full w-full rounded-md border"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No se pudo cargar la vista previa del PDF.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
