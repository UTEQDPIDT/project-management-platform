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
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

import { IUser } from '@repo/types';
import { useUserProfile } from 'context/profile-provider';
import FilePreviewDialog from './file-preview-dialog';

type FileContextValue = {
  onDelete?: (fileId: string) => void;
  onDownload?: (fileId: string) => void;
  currentUser: IUser;
  isAdmin: boolean;
  allowDelete: boolean;
  deleteMode: 'ownerOrAdmin' | 'backend';
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
  allowDelete?: boolean;
  deleteMode?: 'ownerOrAdmin' | 'backend';
  className?: string;
  files?: IFile[];
};

export default function FileList({
  children,
  className,
  isAdmin,
  allowDelete = true,
  deleteMode = 'ownerOrAdmin',
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
        allowDelete,
        deleteMode,
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
  const { onDelete, onDownload, currentUser, isAdmin, allowDelete, deleteMode } =
    useFileContext();
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const canDelete: boolean =
    allowDelete &&
    (deleteMode === 'backend' ||
      isAdmin ||
      (currentUser && file.owner && currentUser._id === file.owner._id));
  const isPdf = file.mimetype === 'application/pdf';
  const isImage = file.mimetype?.startsWith('image/');
  const canPreview = isPdf || isImage;

  const handleOpenPreview = async () => {
    if (!canPreview) return;

    try {
      setIsViewerOpen(true);
      setIsLoadingPreview(true);
      setPreviewError(null);
      setPreviewBlobUrl(null);
      const blobUrl = await getFileBlobUrl(file._id);
      setPreviewBlobUrl(blobUrl);
    } catch (error) {
      console.error('Failed to open file preview:', error);
      setPreviewError('No se pudo cargar la vista previa del archivo.');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (isViewerOpen) return;

    if (previewBlobUrl) {
      window.URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
    setPreviewError(null);
  }, [isViewerOpen, previewBlobUrl]);

  useEffect(() => {
    return () => {
      if (previewBlobUrl) {
        window.URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [previewBlobUrl]);

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-xs" variant="ghost">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="flex flex-col gap-1">
          {canPreview && (
            <DropdownMenuItem onClick={handleOpenPreview} disabled={isLoadingPreview}>
              <Eye /> {isLoadingPreview ? 'Abriendo archivo...' : 'Ver archivo'}
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

      <FilePreviewDialog
        open={isViewerOpen}
        onOpenChange={setIsViewerOpen}
        fileName={file.originalName}
        mimeType={file.mimetype}
        previewBlobUrl={previewBlobUrl}
        isLoading={isLoadingPreview}
        errorMessage={previewError}
        onRetry={handleOpenPreview}
        onDownload={() => onDownload?.(file._id)}
      />
    </div>
  );
};
