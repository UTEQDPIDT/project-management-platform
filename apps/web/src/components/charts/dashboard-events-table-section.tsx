'use client';

import Link from 'next/link';
import { Copy, ExternalLink, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { copyValue, formatDatePeriod } from '@/lib/utils';
import { useDeleteEvent } from '@/hooks/events';
import { EventType, IEvent } from '@repo/types';

const MAX_EVENT_NAME_LENGTH = 50;

type DashboardEventsTableSectionProps = {
	title: string;
	emptyMessage: string;
	events: IEvent[];
};

const truncateText = (value: string, maxLength: number) => {
	if (value.length <= maxLength) return value;
	return `${value.slice(0, maxLength)}...`;
};

const getEventTypeVariant = (type: EventType) => {
	if (type === EventType.EXTERNO) return 'blue' as const;
	return 'orange' as const;
};

const formatEventPeriod = (event: IEvent) => {
	const startDate = new Date(event.startDate);
	const endDate = new Date(event.endDate ?? event.startDate);

	if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
		return 'Sin fecha';
	}

	return formatDatePeriod(startDate, endDate);
};

const getParticipantsCount = (event: IEvent) => {
	return event.attendance?.totalParticipants ?? 0;
};

const EventActions = ({ event }: { event: IEvent }) => {
	const deleteEvent = useDeleteEvent();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon-sm">
					<MoreHorizontal />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Acciones</DropdownMenuLabel>
				<DropdownMenuItem asChild>
					<Link href={`/admin/eventos/${event._id}/editar`}>
						<Pencil /> Editar evento
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href={`/admin/eventos/${event._id}`}>
						<ExternalLink /> Visitar evento
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => copyValue(event._id)}>
					<Copy /> Copiar ID
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild className="hover:text-destructive-foreground">
					<Dialog>
						<DialogTrigger className="has-[>svg]:px-2 [&_svg]:text-muted-foreground hover:[&_svg]:text-destructive-foreground px-0 border-transparent w-full h-8 justify-start hover:text-destructive-foreground font-normal">
							<Trash />
							Eliminar evento
						</DialogTrigger>
						<DialogContent>
							<Badge variant="destructive">Eliminando</Badge>
							<DialogTitle>{event.name}</DialogTitle>
							<DialogDescription>
								¿Seguro deseas eliminar el evento? Esta es una operación
								irreversible.
							</DialogDescription>
							<div className="flex gap-2">
								<DialogClose asChild>
									<Button variant="outline">Cancelar</Button>
								</DialogClose>
								<DialogClose asChild>
									<Button
										onClick={() => deleteEvent.mutate(event._id)}
										variant="destructive"
									>
										Eliminar
									</Button>
								</DialogClose>
							</div>
						</DialogContent>
					</Dialog>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export function DashboardEventsTableSection({
	title,
	emptyMessage,
	events,
}: DashboardEventsTableSectionProps) {
	if (!events.length) {
		return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
	}

	return (
		<div className="w-full">
			<div className="mb-2 flex items-center justify-between">
				<h4 className="text-sm font-semibold text-muted-foreground">{title}</h4>
				<span className="text-sm font-medium text-muted-foreground">
					{events.length} evento{events.length === 1 ? '' : 's'}
				</span>
			</div>
			<Table className="min-w-190 table-fixed">
				<TableHeader>
					<TableRow>
						<TableHead className="w-[25%]">Evento:</TableHead>
						<TableHead className="w-[10%]">Tipo:</TableHead>
						<TableHead className="w-[10%] text-center">Participantes:</TableHead>
						<TableHead className="w-[10%]">Organizador:</TableHead>
						<TableHead className="w-[15%]">Creado por:</TableHead>
						<TableHead className="w-[30%]">Periodo del evento:</TableHead>
						<TableHead className="w-[8%]">Acciones:</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{events.map((event) => {
						const organizerName = event.organization?.trim() || 'Sin organizador';
						const creatorName = event.createdBy
							? `${event.createdBy.givenName} ${event.createdBy.familyName}`
							: 'Sin creador';

						return (
							<TableRow key={event._id}>
								<TableCell className="font-medium truncate" title={event.name}>
									{truncateText(event.name, MAX_EVENT_NAME_LENGTH)}
								</TableCell>
								<TableCell>
									<Badge variant={getEventTypeVariant(event.type)}>{event.type}</Badge>
								</TableCell>
								<TableCell className="text-center">
									{getParticipantsCount(event)}
								</TableCell>
								<TableCell className="truncate" title={organizerName}>
									{organizerName}
								</TableCell>
								<TableCell className="truncate" title={creatorName}>
									{creatorName}
								</TableCell>
								<TableCell className="truncate" title={formatEventPeriod(event)}>
									{formatEventPeriod(event)}
								</TableCell>
								<TableCell>
									<EventActions event={event} />
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
