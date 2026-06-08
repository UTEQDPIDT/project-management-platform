'use client';

import React from 'react';
import { useAllProjects } from '@/hooks/projects';
import { calculateProgress, formatDatePeriod } from '@/lib/utils';
import { useQueries } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { IActivity, IProject, ProjectStatus, TeamMembershipStatus } from '@repo/types';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { getActivitiesByEntityId } from '@/services/activities.service';

type DashboardProjectsTableProps = {
	dateRange: {
		startDate: string;
		endDate: string;
	};
};

const MAX_PROJECT_NAME_LENGTH = 50;

const normalizeProjectStatus = (status?: string): ProjectStatus => {
	const value = (status ?? '').trim().toUpperCase();

	if (value === 'IN_PROGRESS' || value === 'EN PROGRESO' || value === 'PROGRESS') {
		return ProjectStatus.IN_PROGRESS;
	}

	if (value === 'COMPLETED' || value === 'COMPLETADO') {
		return ProjectStatus.COMPLETED;
	}

	return ProjectStatus.PENDING;
};

const getDisplayProjectStatus = (
	status: string | undefined,
	progress: number,
): ProjectStatus => {
	const normalizedStatus = normalizeProjectStatus(status);

	if (normalizedStatus !== ProjectStatus.PENDING) {
		return normalizedStatus;
	}

	if (progress >= 100) {
		return ProjectStatus.COMPLETED;
	}

	if (progress > 0) {
		return ProjectStatus.IN_PROGRESS;
	}

	return ProjectStatus.PENDING;
};

const getProjectStatusLabel = (status: ProjectStatus) => {
	if (status === ProjectStatus.IN_PROGRESS) return 'En progreso';
	if (status === ProjectStatus.COMPLETED) return 'Completado';
	return 'Pendiente';
};

const getProjectStatusVariant = (status: ProjectStatus) => {
	if (status === ProjectStatus.IN_PROGRESS) return 'blue' as const;
	if (status === ProjectStatus.COMPLETED) return 'green' as const;
	return 'orange' as const;
};

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

	const typedProjects = React.useMemo(() => (allProjects ?? []) as IProject[], [allProjects]);

	const projectActivitiesQueries = useQueries({
		queries: typedProjects.map((project) => ({
			queryKey: ['activities', project._id],
			queryFn: () => getActivitiesByEntityId(project._id),
			enabled: Boolean(project._id),
		})),
	});

	const projectProgressById = React.useMemo(() => {
		const progressMap = new Map<string, number>();

		typedProjects.forEach((project, index) => {
			const activities = projectActivitiesQueries[index]?.data as IActivity[] | undefined;
			progressMap.set(project._id, calculateProgress(activities ?? []));
		});

		return progressMap;
	}, [typedProjects, projectActivitiesQueries]);

	const projectsInPeriod = React.useMemo(() => {
		if (!typedProjects.length) return [];

		const rangeStart = new Date(dateRange.startDate).getTime();
		const rangeEnd = new Date(dateRange.endDate).getTime();

		if (Number.isNaN(rangeStart) || Number.isNaN(rangeEnd)) return [];

		return typedProjects
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
	}, [typedProjects, dateRange.endDate, dateRange.startDate]);

	const projectsWithStatus = React.useMemo(() => {
		return projectsInPeriod.map((project, index) => {
			const progress = projectProgressById.get(project._id) ?? 0;
			const status = getDisplayProjectStatus(project.status, progress);

			return {
				...project,
				progress,
				status,
			};
		});
	}, [projectProgressById, projectsInPeriod]);

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
				projectsWithStatus.length > 0 ? (
					<div className="w-full overflow-x-auto">
						<Table className="min-w-175 md:min-w-0">
						<TableHeader>
							<TableRow>
								<TableHead>Proyecto</TableHead>
								<TableHead>Estado</TableHead>
								<TableHead className="text-center">Participantes</TableHead>
								<TableHead>Responsable</TableHead>
								<TableHead>Periodo del proyecto</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{projectsWithStatus.map((project) => {
								const ownerName = project.owner
									? `${project.owner.givenName} ${project.owner.familyName}`
									: 'Sin responsable';

								return (
									<TableRow key={project._id}>
										<TableCell className="font-medium" title={project.name}>
											{truncateText(project.name, MAX_PROJECT_NAME_LENGTH)}
										</TableCell>
										<TableCell>
											<Badge variant={getProjectStatusVariant(project.status)}>
												{getProjectStatusLabel(project.status)}
											</Badge>
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
					</div>
				) : (
					<p className="text-sm text-muted-foreground">
						No hay proyectos registrados para este periodo.
					</p>
				)
			) : null}
		</div>
	);
}
