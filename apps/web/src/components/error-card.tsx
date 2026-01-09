import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MessageCircleX, OctagonX, RotateCw } from 'lucide-react';
import { Dialog, DialogTitle, DialogTrigger, DialogContent } from './ui/dialog';

export default function ErrorCard() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Card className="text-red-700 border-red-200 max-w-sm">
        <CardHeader>
          <div className="flex gap-2 items-center">
            <div className="flex items-center justify-center w-fit bg-red-100 text-red-700 rounded-full p-2">
              <OctagonX size={16} />
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle>Ocurrió un Error</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm flex flex-col">
          <div className="flex gap-2 items-center">
            <RotateCw size={14} className="shrink-0" />
            <span>Intenta refrescar la página</span>
          </div>
          <div className="flex gap-2 items-center">
            <MessageCircleX size={14} className="shrink-0" />
            <span>
              Si el error persiste puedes
              <Dialog>
                <DialogTrigger className="px-1 hover:bg-transparent hover:text-destructive-foreground hover:underline">
                  levantar un reporte
                </DialogTrigger>

                <DialogContent>
                  <DialogTitle>Reporte</DialogTitle>
                </DialogContent>
              </Dialog>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
