import { IFile } from '@repo/types';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { downloadFile } from '@/services/files.service';
import { ChevronDown, Download, Paperclip, Trash } from 'lucide-react';
import LoadingMessage from './loading-message';
import { ButtonGroup } from './ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useDeleteFile } from '@/hooks/files';
import { cn } from '@/lib/utils';

type FileButtonProps = {
  file: IFile;
  canDelete?: boolean;
  className?: string;
};

export default function FileButton({
  file,
  canDelete = false,
  className,
}: FileButtonProps) {
  const deleteFile = useDeleteFile();

  const [isLoading, setIsLoading] = useState(false);
  const handleDownload = async () => {
    try {
      setIsLoading(true);
      await downloadFile(file._id, file.originalName);
    } catch (error) {
      console.error('Failed to download file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    deleteFile.mutate({ fileId: file._id });
  };

  return (
    <ButtonGroup>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            disabled={isLoading}
            className={cn(className)}
          >
            {isLoading ? (
              <LoadingMessage message="descargando" />
            ) : (
              <div className="flex items-center gap-1 overflow-x-hidden">
                <Paperclip />
                <span className="truncate">{file.originalName}</span>
              </div>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Descargar</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon-sm" aria-label="Más opciones">
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleDownload} disabled={isLoading}>
              <Download />
              Descargar archivo
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteFile.isPending || !canDelete}
            >
              <Trash />
              Eliminar archivo
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
