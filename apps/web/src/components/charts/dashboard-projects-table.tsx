'use client';

import React from 'react';
import { useAllProjects } from '@/hooks/projects';
import { formatDatePeriod } from '@/lib/utils';
import { IProject, TeamMembershipStatus } from '@repo/types';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

type DashboardProjectsTableProps = {
	dateRange: {
		startDate: string;
		endDate: string;
	};
};

const MAX_PROJECT_NAME_LENGTH = 50;

const truncateText = (value: string, maxLength: number) => {
	if (value.length <= maxLength) return value;
	return `${value.slice(0, maxLength)}...`;
};

const formatProjectPeriod = (project: IProject) => {
	const startDate = new Date(project.startDate);
	const endDate = new Date(project.endDate ?? project.startDate);

	if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
		return 'Sin fecha';
	}

	return formatDatePeriod(startDate, endDate);
};

const getParticipantsCount = (project: IProject) => {
	const activeMemberships =
		project.team?.memberships?.filter(
			(membership) => membership.status === TeamMembershipStatus.ACTIVE,
		) ?? [];

	if (activeMemberships.length > 0) return activeMemberships.length;
	return project.owner ? 1 : 0;
};

export function DashboardProjectsTable({
	dateRange,
}: DashboardProjectsTableProps) {
	const {
		data: allProjects,
		isLoading: isProjectsLoading,
		isError: isProjectsError,
	} = useAllProjects();

	const projectsInPeriod = React.useMemo(() => {
		if (!allProjects) return [];

		const rangeStart = new Date(dateRange.startDate).getTime();
		const rangeEnd = new Date(dateRange.endDate).getTime();

		if (Number.isNaN(rangeStart) || Number.isNaN(rangeEnd)) return [];

		return (allProjects as IProject[])
			.filter((project) => {
				const projectStart = new Date(project.startDate).getTime();
				const projectEnd = new Date(project.endDate ?? project.startDate).getTime();

				if (Number.isNaN(projectStart) || Number.isNaN(projectEnd)) return false;

				return projectStart <= rangeEnd && projectEnd >= rangeStart;
			})
			.sort((a, b) => {
				const bStart = new Date(b.startDate).getTime();
				const aStart = new Date(a.startDate).getTime();
				return bStart - aStart;
			});
	}, [allProjects, dateRange.endDate, dateRange.startDate]);

	return (
		<div className="rounded-2xl border border-zinc-500 p-4">
			<div className="mb-3">
				<h3 className="text-base font-semibold">Proyectos del periodo</h3>
				<p className="text-sm text-muted-foreground">
					Mostrando proyectos activos entre{' '}
					{new Date(dateRange.startDate).toLocaleDateString()} y{' '}
					{new Date(dateRange.endDate).toLocaleDateString()}.
				</p>
			</div>

			{isProjectsLoading ? <p>Cargando proyectos del periodo...</p> : null}

			{isProjectsError ? (
				<p className="text-destructive">No se pudieron cargar los proyectos.</p>
			) : null}

			{!isProjectsLoading && !isProjectsError ? (
				projectsInPeriod.length > 0 ? (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Proyecto</TableHead>
								<TableHead className="text-center">Participantes</TableHead>
								<TableHead>Responsable</TableHead>
								<TableHead>Periodo del proyecto</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{projectsInPeriod.map((project) => {
								const ownerName = project.owner
									? `${project.owner.givenName} ${project.owner.familyName}`
									: 'Sin responsable';

								return (
									<TableRow key={project._id}>
										<TableCell className="font-medium" title={project.name}>
											{truncateText(project.name, MAX_PROJECT_NAME_LENGTH)}
										</TableCell>
										<TableCell className="text-center">
											{getParticipantsCount(project)}
										</TableCell>
										<TableCell>{ownerName}</TableCell>
										<TableCell>{formatProjectPeriod(project)}</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				) : (
					<p className="text-sm text-muted-foreground">
						No hay proyectos registrados para este periodo.
					</p>
				)
			) : null}
		</div>
	);
}
