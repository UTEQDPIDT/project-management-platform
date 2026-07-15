'use client';

import React from 'react';
import { useAllProjects } from '@/hooks/projects';
import { calculateProgress, formatDatePeriod } from '@/lib/utils';
import { useQueries } from '@tanstack/react-query';
import { IActivity, IProject, ProjectStatus } from '@repo/types';
import { addMonths } from 'date-fns';
import { getActivitiesByEntityId } from '@/services/activities.service';
import {
	DashboardProjectsTableSection,
	type DashboardProjectRow,
} from './dashboard-projects-table-section';

type DashboardProjectsTableProps = {
	dateRange: {
		startDate: string;
		endDate: string;
	};
};

const normalizeProjectStatus = (status?: string): ProjectStatus => {
	const value = (status ?? '').trim().toUpperCase();

	if (value === 'IN_PROGRESS' || value === 'EN PROGRESO' || value === 'PROGRESS') {
		return ProjectStatus.IN_PROGRESS;
	}

	if (value === 'COMPLETED' || value === 'COMPLETADO') {
		return ProjectStatus.COMPLETED;
	}

	if (value === 'CLOSED' || value === 'CERRADO') {
		return ProjectStatus.CLOSED;
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

const isLongDurationProject = (project: IProject) => {
	const startDate = new Date(project.startDate);
	const endDate = project.endDate ? new Date(project.endDate) : new Date();

	if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
		return false;
	}

	return endDate > addMonths(startDate, 4);
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

	const projectsWithStatus = React.useMemo<DashboardProjectRow[]>(() => {
		return projectsInPeriod.map((project) => {
			const progress = projectProgressById.get(project._id) ?? 0;
			const status = getDisplayProjectStatus(project.status, progress);

			return {
				...project,
				progress,
				status,
			};
		});
	}, [projectProgressById, projectsInPeriod]);

	const shortDurationProjects = React.useMemo(
		() => projectsWithStatus.filter((project) => !isLongDurationProject(project)),
		[projectsWithStatus],
	);

	const longDurationProjects = React.useMemo(
		() => projectsWithStatus.filter((project) => isLongDurationProject(project)),
		[projectsWithStatus],
	);

	return (
		<div className="rounded-2xl border border-zinc-500 p-4">
			<div className="mb-4">
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
				<div className="flex flex-col gap-6">
					<DashboardProjectsTableSection
						title="Proyectos con duración de hasta un cuatrimestre:"
						emptyMessage="No hay proyectos de corta duración para este periodo."
						projects={shortDurationProjects}
					/>
					<DashboardProjectsTableSection
						title="Proyectos con duración de más de un cuatrimestre:"
						emptyMessage="No hay proyectos de larga duración para este periodo."
						projects={longDurationProjects}
					/>
				</div>
			) : null}
		</div>
	);
}
