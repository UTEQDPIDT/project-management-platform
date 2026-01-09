import { BadgeVariants, IEvent, IUser } from '@repo/types';
import { userProfile } from 'context/profile-provider';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowUpRight,
  Calendar,
  CheckSquare,
  Info,
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

interface EventCardProps {
  event: IEvent;
}

export function EventCard({ event }: EventCardProps) {
  /**
   * Context
   */
  const { user } = userProfile();

  /**
   * Tanstack
   */
  const registerParticipant = useRegisterParticipant();

  /**
   * Conditionally render buttons
   */
  const currentUserId = user._id;
  const isOwner = event.createdBy._id === currentUserId;
  const isParticipant = event.participants.some(
    (p: IUser) => p._id === currentUserId,
  );

  const renderActionButton = () => {
    if (isOwner || isParticipant) {
      return (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/user/eventos/${event._id}`}>
            <span className="flex gap-1 items-center">
              Visitar
              <ArrowUpRight />
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
    <Card className="w-full gap-4 min-w-96">
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex gap-2 items-start">
            <IconSquare color="blue">
              <Calendar />
            </IconSquare>
            <div className="flex flex-col gap-1">
              <CardTitle className="line-clamp-1 leading-5 h-6">
                {event.name}
              </CardTitle>
              <CardDescription className="text-xs line-clamp-1">
                {event?.organization}
              </CardDescription>
            </div>
          </div>
          <Badge variant={badgeVariant} className="h-6">
            {event.isPrivate ? 'Privado' : 'Público'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 h-full text-sm text-muted-foreground">
        <div className="flex gap-2">
          <Info className="shrink-0" size={14} />
          <CardDescription className="h-26 line-clamp-5">
            {event.summary}
          </CardDescription>
        </div>

        <div className="flex gap-2 group items-center">
          <MapPin className="shrink-0" size={14} />
          <span>{event.location}</span>
          <CopyButton
            valueToCopy={event.location}
            className="group-hover:opacity-100 opacity-0"
          />
        </div>

        <div className="flex gap-2 items-center">
          <Calendar size={14} />
          {event.endDate ? (
            <div>
              {format(event.startDate, "d 'de' MMMM 'al' ", {
                locale: es,
              })}
              {format(event.endDate, "d 'de' MMMM 'de' yyyy", {
                locale: es,
              })}
            </div>
          ) : (
            <div>
              {format(event.startDate, "d 'de' MMMM 'de' yyyy", {
                locale: es,
              })}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex border-t gap-3 justify-between items-center">
        <div className="flex gap-3">
          <AvatarRow profiles={event.participants} />

          <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
            <CheckSquare size={14} />
            {event.activities?.length}
          </span>

          <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
            <Shapes size={14} />
            {event.products?.length}
          </span>
        </div>
        <CardAction>{renderActionButton()}</CardAction>
      </CardFooter>
    </Card>
  );
}
