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
  actionButtonText?: string;
  onAction?: () => void;
  activityOptions?: ReactNode;
  enableOptions?: boolean;
  className?: string;
}

export function ActivityCard({
  activity,
  actionButtonText = 'Accion',
  onAction,
  activityOptions,
  enableOptions,
  className,
}: Props) {
  let badgeVariant:
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
      badgeVariant = 'purple';
      break;
    case 'Media':
      badgeVariant = 'orange';
      break;
    case 'Baja':
      badgeVariant = 'gray';
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
                {activityOptions}
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

        {activity.priority && (
          <Badge variant={badgeVariant}>{activity.priority}</Badge>
        )}
      </CardContent>
      {onAction && (
        <CardFooter>
          <Button>{actionButtonText}</Button>
        </CardFooter>
      )}
    </Card>
  );
}
