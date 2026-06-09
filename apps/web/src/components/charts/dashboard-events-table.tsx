'use client';

import React from 'react';
import { useGetAllEvents } from '@/hooks/events';
import { IEvent } from '@repo/types';
import { DashboardEventsTableSection } from './dashboard-events-table-section';

type DashboardEventsTableProps = {
	dateRange: {
		startDate: string;
		endDate: string;
	};
};

export function DashboardEventsTable({ dateRange }: DashboardEventsTableProps) {
	const {
		data: allEvents,
		isLoading: isEventsLoading,
		isError: isEventsError,
	} = useGetAllEvents();

	const typedEvents = React.useMemo(() => (allEvents ?? []) as IEvent[], [allEvents]);

	const eventsInPeriod = React.useMemo(() => {
		if (!typedEvents.length) return [];

		const rangeStart = new Date(dateRange.startDate).getTime();
		const rangeEnd = new Date(dateRange.endDate).getTime();

		if (Number.isNaN(rangeStart) || Number.isNaN(rangeEnd)) return [];

		return typedEvents
			.filter((event) => {
				const eventStart = new Date(event.startDate).getTime();
				const eventEnd = new Date(event.endDate ?? event.startDate).getTime();

				if (Number.isNaN(eventStart) || Number.isNaN(eventEnd)) return false;

				return eventStart <= rangeEnd && eventEnd >= rangeStart;
			})
			.sort((a, b) => {
				const bStart = new Date(b.startDate).getTime();
				const aStart = new Date(a.startDate).getTime();
				return bStart - aStart;
			});
	}, [typedEvents, dateRange.endDate, dateRange.startDate]);

	return (
		<div className="rounded-2xl border border-zinc-500 p-4">
			<div className="mb-4">
				<h3 className="text-base font-semibold">Eventos del periodo</h3>
				<p className="text-sm text-muted-foreground">
					Mostrando eventos activos entre{' '}
					{new Date(dateRange.startDate).toLocaleDateString()} y{' '}
					{new Date(dateRange.endDate).toLocaleDateString()}.
				</p>
			</div>

			{isEventsLoading ? <p>Cargando eventos del periodo...</p> : null}

			{isEventsError ? (
				<p className="text-destructive">No se pudieron cargar los eventos.</p>
			) : null}

			{!isEventsLoading && !isEventsError ? (
				<div className="flex flex-col gap-6">
					<DashboardEventsTableSection
						title="Eventos del periodo:"
						emptyMessage="No hay eventos para este periodo."
						events={eventsInPeriod}
					/>
				</div>
			) : null}
		</div>
	);
}
