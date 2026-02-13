'use client';

import { cn, formatFileSize, trimFileNameMiddle } from '@/lib/utils';
import { IFile, UserRole } from '@repo/types';
import { Download, FileText, Image, MoreHorizontal, Trash } from 'lucide-react';
import { PropsWithChildren, createContext, useContext } from 'react';
import { Button } from './ui/button';
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

  const canDelete: boolean =
    isAdmin ||
    (currentUser && file.owner && currentUser._id === file.owner._id);

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-xs" variant="ghost">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="flex flex-col gap-1">
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
    </div>
  );
};
