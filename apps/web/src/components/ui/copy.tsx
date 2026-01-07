import React from 'react';
import { Button } from './button';
import { Copy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { toast } from 'sonner';

export default function CopyButton({
  valueToCopy,
  variant = 'ghost',
  className,
}: {
  valueToCopy: string;
  variant?: 'outline' | 'ghost' | null | undefined;
  className?: string;
}) {
  const handleClick = () => {
    navigator.clipboard.writeText(valueToCopy);
    toast.success('Copiado al portapapeles');
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={className}
          variant={variant}
          aria-label="Copiar"
          size="icon-xs"
          onClick={handleClick}
        >
          <Copy />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Copiar</TooltipContent>
    </Tooltip>
  );
}
