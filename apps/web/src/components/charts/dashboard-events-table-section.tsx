'use client';

import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { formatDatePeriod } from '@/lib/utils';
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
	if (Array.isArray(event.participants) && event.participants.length > 0) {
		return event.participants.length;
	}

	return event.attendance?.totalParticipants ?? 0;
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
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
