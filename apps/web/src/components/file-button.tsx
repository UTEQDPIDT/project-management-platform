import { IFile } from '@repo/types';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { downloadFile } from '@/services/files.service';
import { Paperclip } from 'lucide-react';
import LoadingMessage from './loading-message';

type FileButtonProps = {
  file: IFile;
};

export default function FileButton({ file }: FileButtonProps) {
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

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleDownload}
          disabled={isLoading}
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
  );
}
