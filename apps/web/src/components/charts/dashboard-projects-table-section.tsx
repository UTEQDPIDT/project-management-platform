'use client';

import Link from 'next/link';
import {
	Copy,
	DoorOpen,
	ExternalLink,
	MoreHorizontal,
	Pencil,
	Pin,
	Trash,
	Lock,
 	XCircle,
} from 'lucide-react';
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
import {
	useCloseProject,
	useDeleteProject,
	useFirstValidationProject,
	useReopenProject,
 	useCancelFirstValidationProject,
} from '@/hooks/projects';
import {
	IProject,
	ProjectStatus,
	TeamMembershipStatus,
} from '@repo/types';
import { useUserProfile } from 'context/profile-provider';
import { getProjectStatusBadge } from '@/lib/badge-mappings';

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

const ProjectActions = ({ project }: { project: IProject }) => {
	const { user } = useUserProfile();
	const deleteProject = useDeleteProject();
	const firstValidationProject = useFirstValidationProject();
	const cancelFirstValidationProject = useCancelFirstValidationProject();
	const closeProject = useCloseProject();
	const reopenProject = useReopenProject();
	const isClosed = project.status === ProjectStatus.CLOSED;
	const closedById =
		typeof project.closedBy === 'string' ? project.closedBy : project.closedBy?._id;
	const hasFirstValidation = Boolean(project.firstValidatedBy);
	const canFirstValidate = Boolean(
		!isClosed &&
			project.status === ProjectStatus.COMPLETED &&
			user?.canValidateProjets &&
			!hasFirstValidation,
	);
	const canReopen = Boolean(
		isClosed &&
			user?.canCloseProject &&
			closedById &&
			closedById === user?._id,
	);
	const canClose = Boolean(
		!isClosed &&
			(project.status === ProjectStatus.COMPLETED ||
				project.status === ProjectStatus.FIRST_VALIDATION) &&
			user?.canCloseProject &&
			hasFirstValidation,
	);
	const canCancelFirstValidation = Boolean(
		!isClosed &&
			project.status === ProjectStatus.FIRST_VALIDATION &&
			user?.canValidateProjets &&
			hasFirstValidation,
	);

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
					<Link href={`/admin/proyectos/${project._id}`}>
						<ExternalLink /> Visitar proyecto
					</Link>
				</DropdownMenuItem>
				{!isClosed && (
					<DropdownMenuItem asChild>
						<Link href={`/admin/proyectos/${project._id}/editar`}>
							<Pencil /> Editar proyecto
						</Link>
					</DropdownMenuItem>
				)}
				<DropdownMenuItem onClick={() => copyValue(project._id)}>
					<Copy /> Copiar ID
				</DropdownMenuItem>

				{canFirstValidate && (
					<DropdownMenuItem
						onClick={() => firstValidationProject.mutate(project._id)}
						disabled={firstValidationProject.isPending}
					>
						<Pin /> Primera validación
					</DropdownMenuItem>
				)}

				{canCancelFirstValidation && (
					<DropdownMenuItem
						onClick={() => cancelFirstValidationProject.mutate(project._id)}
						disabled={cancelFirstValidationProject.isPending}
					>
						<XCircle /> Cancelar primera validación
					</DropdownMenuItem>
				)}

				{canClose && (
					<DropdownMenuItem
						onClick={() => closeProject.mutate(project._id)}
						disabled={closeProject.isPending}
					>
						<Lock /> Cerrar proyecto (2da validación)
					</DropdownMenuItem>
				)}

				{canReopen && (
					<DropdownMenuItem
						onClick={() => reopenProject.mutate(project._id)}
						disabled={reopenProject.isPending}
					>
						<DoorOpen /> Reabrir proyecto
					</DropdownMenuItem>
				)}

				{!isClosed && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild className="hover:text-destructive-foreground">
							<Dialog>
								<DialogTrigger className="has-[>svg]:px-2 [&_svg]:text-muted-foreground hover:[&_svg]:text-destructive-foreground px-0 border-transparent w-full h-8 justify-start hover:text-destructive-foreground font-normal">
									<Trash />
									Eliminar proyecto
								</DialogTrigger>
								<DialogContent>
									<Badge variant="destructive">Eliminando</Badge>
									<DialogTitle>{project.name}</DialogTitle>
									<DialogDescription>
										¿Seguro deseas eliminar el proyecto? Esta es una operación
										irreversible.
									</DialogDescription>
									<div className="flex gap-2">
										<DialogClose asChild>
											<Button variant="outline">Cancelar</Button>
										</DialogClose>
										<DialogClose asChild>
											<Button
												onClick={() => deleteProject.mutate(project._id)}
												variant="destructive"
											>
												Eliminar
											</Button>
										</DialogClose>
									</div>
								</DialogContent>
							</Dialog>
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
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
						<TableHead className="w-[8%]">Acciones:</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{projects.map((project) => {
						const projectStatusBadge = getProjectStatusBadge(project.status);
						const ownerName = project.owner
							? `${project.owner.givenName} ${project.owner.familyName}`
							: 'Sin responsable';

						return (
							<TableRow key={project._id}>
								<TableCell className="font-medium truncate" title={project.name}>
									{truncateText(project.name, MAX_PROJECT_NAME_LENGTH)}
								</TableCell>
								<TableCell>
									<Badge variant={projectStatusBadge.variant}>
										{projectStatusBadge.label}
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
								<TableCell>
									<ProjectActions project={project} />
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}