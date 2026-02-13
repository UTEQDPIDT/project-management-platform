import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import IconSquare from './icon-square';
import { MoreHorizontal, Settings, UserMinus, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog';
import { Separator } from './ui/separator';
import { ParticipantsForm } from './forms/participants-form';
import { ProfileInfo } from './profile-info';
import { IEvent, IUser, UserRole } from '@repo/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './ui/empty';
import { useUserProfile } from 'context/profile-provider';
import { useRemoveParticipant } from '@/hooks/events';
import { cn } from '@/lib/utils';

interface ParticipantsCardProps {
  event: IEvent;
  className?: string;
}

export default function ParticipantsCard({
  event,
  className,
}: ParticipantsCardProps) {
  const { user } = useUserProfile();
  const removeParticipant = useRemoveParticipant();

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <IconSquare color="blue">
              <Users />
            </IconSquare>

            <CardTitle>Participantes</CardTitle>
          </div>

          {user.role === UserRole.ADMIN && (
            <Dialog>
              <DialogTrigger className="h-8 px-3 hover:bg-secondary/90 border">
                <Settings /> Gestionar
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Gestionar Participantes</DialogTitle>
                <ParticipantsForm
                  eventId={event._id}
                  participants={event.participants}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {event.participants.length > 0 ? (
          <div className="flex flex-col gap-3">
            {event.participants.map((p: IUser) => (
              <div key={p._id} className="flex justify-between group">
                <ProfileInfo
                  size="sm"
                  givenName={p.givenName}
                  familyName={p.familyName}
                  avatarUrl={p.avatarUrl}
                  email={p.email}
                />

                {user.role === UserRole.ADMIN && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={false}
                        onClick={() => {
                          removeParticipant.mutate({
                            eventId: event._id,
                            userId: p._id,
                          });
                        }}
                      >
                        <UserMinus /> Expulsar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>No Hay Participantes</EmptyTitle>
              <EmptyDescription>
                No se han agregado participantes al evento. Agrega
                participantes.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
