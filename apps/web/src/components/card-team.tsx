import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from './ui/card';
import { Button } from './ui/button';
import { ITeam } from '@repo/types';
import { User, UserPlus, Users } from 'lucide-react';
import IconSquare from './icon-square';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import AvatarRow from './avatar-row';

export default function CardTeam({
  teamName,
  summary,
  division,
  grade,
  collaborators,
  members,
}: Pick<
  ITeam,
  'teamName' | 'summary' | 'division' | 'grade' | 'collaborators' | 'members'
>) {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <div className="flex gap-2 items-center">
          <IconSquare>
            <Users />
          </IconSquare>
          <div className="flex flex-col gap-1">
            <CardTitle>{teamName}</CardTitle>
            <CardDescription className="text-xs">{division}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="h-24">{summary}</CardDescription>
        {/* <AvatarRow profiles={} /> */}
      </CardContent>
      <CardFooter className="flex gap-2 justify-between items-end">
        <div>
          <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
            <User size={14} />
            {collaborators.length + members.length}
          </span>
        </div>
        <CardAction>
          <Button size="sm">
            <UserPlus />
            Unirse
          </Button>
        </CardAction>
      </CardFooter>
    </Card>
  );
}
