'use client';

import { cn } from '@/lib/utils';
import { IFile } from '@repo/types';
import { Download, FileText, Image, MoreHorizontal, Trash } from 'lucide-react';
import { PropsWithChildren, createContext, useContext } from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

type FileContextValue = {
  onDelete?: (fileId: string) => void;
  onDownload?: (fileId: string) => void;
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
};

export default function FileList({ children, ...handlers }: FileListProps) {
  return (
    <FileContext.Provider value={handlers}>
      <ul className="space-y-2">{children}</ul>
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
        <span className="text-sm line-clamp-1">{file.originalName}</span>
      </div>
      <div>{children}</div>
    </li>
  );
};

FileList.Actions = function FileActions({ fileId }: { fileId: string }) {
  const { onDelete, onDownload } = useFileContext();

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-xs" variant="ghost">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="flex flex-col gap-1">
          <DropdownMenuItem onClick={() => onDownload?.(fileId)}>
            <Download /> Descargar archivo
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onDelete?.(fileId)}>
            <Trash /> Eliminar archivo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
