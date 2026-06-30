'use client';

import { BadgeVariants, IEvent, IUser } from '@repo/types';
import { useUserProfile } from 'context/profile-provider';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowUpRight,
  Calendar,
  CheckSquare,
  MapPin,
  Shapes,
} from 'lucide-react';
import Link from 'next/link';
import AvatarRow from './avatar-row';
import IconSquare from './icon-square';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import CopyButton from './ui/copy';
import { useRegisterParticipant } from '@/hooks/events';
import { useActivitiesByEntity } from '@/hooks/activities';
import { getBaseUrlBasedOnRole } from '@/lib/utils';

type EventCardVariant = 'default' | 'compact';
interface EventCardProps {
  event: IEvent;
  variant?: EventCardVariant;
  className?: string;
}

function EventCardCompact({ event, className }: { event: IEvent; className?: string }) {
  const { user } = useUserProfile();
  const baseUrl = getBaseUrlBasedOnRole(user.role);

  const profiles =
    event.participants?.map((u: IUser) => ({
      givenName: u.givenName,
      familyName: u.familyName,
      avatarUrl: u.avatarUrl,
    })) || [];

  return (
    /* Eliminado max-w-52 y shrink-0 fijos para fluir simétricamente en el CSS Grid */
    <Link
      href={`${baseUrl}/eventos/${event._id}`}
      className={`w-full block h-36 ${className}`}
    >
      <Card className="hover:shadow-xl w-full h-36 flex flex-col justify-between transition-shadow duration-200">
        <CardHeader className="pb-1">
          <CardTitle className="line-clamp-1 leading-5 text-sm sm:text-base">{event.name}</CardTitle>
        </CardHeader>
        <CardContent className="py-0">
          <div className="flex gap-1 items-center text-xs text-muted-foreground whitespace-nowrap overflow-hidden">
            <Calendar size={14} className="shrink-0" />
            {event.endDate ? (
              <span className="truncate">
                {format(event.startDate, "d 'de' MMM", { locale: es })} -{' '}
                {format(event.endDate, "d 'de' MMM", { locale: es })}
              </span>
            ) : (
              <span className="truncate">
                {format(event.startDate, "d 'de' MMMM", { locale: es })}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-1">
          <AvatarRow profiles={profiles} />
        </CardFooter>
      </Card>
    </Link>
  );
}

function EventCardComplete({ event }: { event: IEvent }) {
  const { user } = useUserProfile();
  const baseUrl = getBaseUrlBasedOnRole(user?.role);
  const { data: activities } = useActivitiesByEntity(event._id);
  const registerParticipant = useRegisterParticipant();

  if (!user) return null;

  const currentUserId = user._id;
  const isOwner = event.createdBy?._id === currentUserId;
  const isParticipant = event.participants.some(
    (p: IUser) => p._id === currentUserId,
  );

  const renderActionButton = () => {
    if (isOwner || isParticipant) {
      return (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`${baseUrl}/eventos/${event._id}`}>
            <span className="flex gap-1 items-center">
              Visitar
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        </Button>
      );
    } else {
      return (
        <Button
          size="sm"
          disabled={event.isPrivate || registerParticipant.isPending}
          onClick={() => registerParticipant.mutate({ eventId: event._id })}
        >
          {event.isPrivate ? 'Evento Privado' : 'Entrar'}
        </Button>
      );
    }
  };

  let badgeVariant:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'green'
    | 'gray'
    | 'purple'
    | 'orange'
    | 'blue'
    | null
    | undefined;
  switch (event.isPrivate) {
    case true:
      badgeVariant = BadgeVariants.PURPLE;
      break;
    case false:
      badgeVariant = BadgeVariants.BLUE;
      break;
  }

  return (
    /* Eliminado el min-w-96 que causaba el desborde en pantallas móviles */
    <Card className="w-full flex flex-col gap-4 border-neutral-200">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div className="flex gap-2 items-start min-w-0">
            <IconSquare color="green">
              <Calendar />
            </IconSquare>
            <div className="flex flex-col gap-1 min-w-0">
              <CardTitle className="line-clamp-1 leading-5 text-base sm:text-lg">
                {event.name}
              </CardTitle>
              <CardDescription className="text-xs line-clamp-1">
                {event?.organization}
              </CardDescription>
            </div>
          </div>
          <Badge variant={badgeVariant} className="h-6 shrink-0 whitespace-nowrap">
            {event.isPrivate ? 'Privado' : 'Público'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 h-full text-sm text-muted-foreground min-w-0">
        <CardDescription className="h-26 line-clamp-5 overflow-hidden">
          {event.summary}
        </CardDescription>
        
        {/* Ubicación adaptada */}
        <div className="flex gap-2 group items-center min-w-0">
          <MapPin className="shrink-0" size={14} />
          <span className="truncate">{event.location}</span>
          <CopyButton
            valueToCopy={event.location}
            className="group-hover:opacity-100 opacity-0 hidden sm:flex"
          />
        </div>

        {/* Fechas estructuradas */}
        <div className="flex gap-2 items-center min-w-0">
          <Calendar size={14} className="shrink-0" />
          {event.endDate ? (
            <div className="text-xs sm:text-sm">
              {format(event.startDate, "d 'de' MMMM 'al' ", {
                locale: es,
              })}
              {format(event.endDate, "d 'de' MMMM 'de' yyyy", {
                locale: es,
              })}
            </div>
          ) : (
            <div className="text-xs sm:text-sm">
              {format(event.startDate, "d 'de' MMMM 'de' yyyy", {
                locale: es,
              })}
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Footer adaptable con flex-wrap para celulares delgados */}
      <CardFooter className="flex gap-3 justify-between items-center mt-auto flex-wrap sm:flex-nowrap">
        <div className="flex gap-3 items-center">
          <AvatarRow profiles={event.participants} />
          <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground whitespace-nowrap">
            <CheckSquare size={14} />
            {activities?.length || 0}
          </span>
          {event.acceptsProducts && (
            <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground whitespace-nowrap">
              <Shapes size={14} />
              {event.products?.length || 0}
            </span>
          )}
        </div>
        <CardAction className="w-full sm:w-auto flex justify-end mt-2 sm:mt-0">
          {renderActionButton()}
        </CardAction>
      </CardFooter>
    </Card>
  );
}

export function EventCard({ event, variant = 'default', className }: EventCardProps) {
  if (variant === 'compact') {
    return <EventCardCompact event={event} className={className} />;
  } else {
    return <EventCardComplete event={event} />;
  }
}