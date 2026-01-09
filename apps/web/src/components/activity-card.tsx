import { cn } from '@/lib/utils';
import { IActivity } from '@repo/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Ellipsis, MoveRight } from 'lucide-react';
import AvatarRow from './avatar-row';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ReactNode } from 'react';

interface Props {
  activity: IActivity;
  buttonText?: string;
  buttonIcon?: ReactNode;
  onAction?: () => void;
  options?: ReactNode;
  enableOptions?: boolean;
  showStatus?: boolean;
  showPriority?: boolean;
  className?: string;
}

export function ActivityCard({
  activity,
  buttonText = 'Accion',
  buttonIcon,
  onAction,
  options,
  enableOptions,
  showStatus,
  showPriority,
  className,
}: Props) {
  let priorityBadgeVariant:
    | 'orange'
    | 'gray'
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'blue'
    | 'green'
    | 'purple'
    | null
    | undefined;

  switch (activity.priority) {
    case 'Alta':
      priorityBadgeVariant = 'purple';
      break;
    case 'Media':
      priorityBadgeVariant = 'orange';
      break;
    case 'Baja':
      priorityBadgeVariant = 'gray';
      break;
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex justify-between items-start gap-1">
          <div className="flex flex-col gap-1">
            <CardTitle>{activity.name}</CardTitle>
          </div>

          {enableOptions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="flex flex-col items-start gap-1">
                {options}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {activity.description && (
          <CardDescription>{activity.description}</CardDescription>
        )}

        {activity.assignees && activity.assignees.length > 0 && (
          <AvatarRow profiles={activity.assignees} />
        )}

        {activity.dueDate && (
          <div className="flex gap-1">
            <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
              <Calendar size={14} />
              {format(activity.dueDate, "'Vence el' d 'de' MMM 'de' yyyy", {
                locale: es,
              })}
            </span>
            {activity.dueDateEnd && (
              <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
                <MoveRight size={10} />
                {format(activity.dueDateEnd, "d 'de' MMM 'de' yyyy", {
                  locale: es,
                })}
              </span>
            )}
          </div>
        )}

        {showPriority && (
          <Badge variant={priorityBadgeVariant}>{activity.priority}</Badge>
        )}
      </CardContent>
      {onAction && (
        <CardFooter className="flex justify-end">
          <CardAction>
            <Button variant="outline" onClick={onAction} size="xs">
              {buttonIcon}
              {buttonText}
            </Button>
          </CardAction>
        </CardFooter>
      )}
    </Card>
  );
}
