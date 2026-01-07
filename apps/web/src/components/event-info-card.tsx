import { IEvent, UserRole } from '@repo/types';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import IconSquare from './icon-square';
import { Info, Upload } from 'lucide-react';
import CopyButton from './ui/copy';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from './ui/button';
import { userProfile } from 'context/profile-provider';

interface EventInfoCardProps {
  event: IEvent;
}

export default function EventInfoCard({ event }: EventInfoCardProps) {
  const { user } = userProfile();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex gap-3 items-center">
            <IconSquare>
              <Info />
            </IconSquare>

            <CardTitle>Acerca del Evento</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col text-sm gap-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground w-24">Nombre</span>
            <span>{event.name}</span>
          </div>

          <div className="flex justify-between gap-5">
            <span className="text-muted-foreground w-24">Organización</span>
            <span>{event.organization}</span>
          </div>

          <div className="flex justify-between gap-5">
            <span className="text-muted-foreground">Resumen</span>
            <span className="max-w-96">{event.summary}</span>
          </div>

          <div className="flex justify-between gap-5">
            <span className="text-muted-foreground w-24">Ubicación</span>
            <div className="relative group text-right">
              <span className="max-w-96">{event.location}</span>
              <CopyButton
                valueToCopy={event.location}
                variant="outline"
                className="absolute top-0 right-0 group-hover:opacity-100 opacity-0"
              />
            </div>
          </div>

          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground w-24">Fecha</span>
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

          {user.role === UserRole.ADMIN && (
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground w-24">Reporte</span>
              {event.report ? (
                <span>reporte</span>
              ) : (
                <Button size="xs" variant="outline">
                  <Upload />
                  Subir Reporte
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
