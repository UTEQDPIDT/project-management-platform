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
import { IProject, ProjectStatus, TeamMembershipStatus } from '@repo/types';

const MAX_PROJECT_NAME_LENGTH = 50;

export type DashboardProjectRow = IProject & {
	progress: number;
	status: ProjectStatus;
};

type DashboardProjectsTableSectionProps = {
	title: string;
	emptyMessage: string;
	projects: DashboardProjectRow[];
};

const truncateText = (value: string, maxLength: number) => {
	if (value.length <= maxLength) return value;
	return `${value.slice(0, maxLength)}...`;
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

export function DashboardProjectsTableSection({
	title,
	emptyMessage,
	projects,
}: DashboardProjectsTableSectionProps) {
	if (!projects.length) {
		return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
	}

	return (
		<div className="w-full">
			<div className="mb-2 flex items-center justify-between">
				<h4 className="text-sm font-semibold text-muted-foreground">{title}</h4>
				<span className="text-sm font-medium text-muted-foreground">
					{projects.length} proyecto{projects.length === 1 ? '' : 's'}
				</span>
			</div>
			<Table className="min-w-190 table-fixed">
				<TableHeader>
					<TableRow>
						<TableHead className="w-[30%]">Proyecto:</TableHead>
						<TableHead className="w-[10%]">Estado:</TableHead>
						<TableHead className="w-[10%] text-center">Participantes:</TableHead>
						<TableHead className="w-[20%]">Responsable:</TableHead>
						<TableHead className="w-[30%]">Periodo del proyecto:</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{projects.map((project) => {
						const ownerName = project.owner
							? `${project.owner.givenName} ${project.owner.familyName}`
							: 'Sin responsable';

						return (
							<TableRow key={project._id}>
								<TableCell className="font-medium truncate" title={project.name}>
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
								<TableCell className="truncate" title={ownerName}>
									{ownerName}
								</TableCell>
								<TableCell className="truncate" title={formatProjectPeriod(project)}>
									{formatProjectPeriod(project)}
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}