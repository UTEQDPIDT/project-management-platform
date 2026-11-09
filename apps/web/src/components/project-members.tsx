'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IProject,
  ProjectStatus,
  ProjectValidation,
  TeamMembershipStatus,
  UserRole,
} from '@repo/types';
import { useUserProfile } from 'context/profile-provider';
import { updateProjectMember } from '@/services/projects.service';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import axios from 'axios';

export function ProjectMembers({ project }: { project: IProject }) {
  const { user } = useUserProfile();
  const queryClient = useQueryClient();
  const canManage =
    user.role === UserRole.ADMIN || user._id === project.owner?._id;
  const locked =
    project.status === ProjectStatus.CLOSED ||
    project.validationStatus === ProjectValidation.FINAL_VALIDATION;
  const mutation = useMutation({
    mutationFn: ({
      membershipId,
      selected,
    }: {
      membershipId: string;
      selected: boolean;
    }) => updateProjectMember(project._id, membershipId, selected),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['project', project._id] }),
        queryClient.invalidateQueries({ queryKey: ['projects'] }),
        queryClient.invalidateQueries({ queryKey: ['projects-by-team'] }),
        queryClient.invalidateQueries({ queryKey: ['projects-by-owner'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-projects'] }),
      ]);
      toast.success('Participantes actualizados');
    },
    onError: (error) => {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error('No se pudieron actualizar los participantes', {
        description: typeof message === 'string' ? message : undefined,
      });
      void queryClient.invalidateQueries({
        queryKey: ['project', project._id],
      });
    },
  });

  if (!project.team || !canManage) return null;

  const members = (project.team.memberships ?? []).filter(
    (membership) =>
      membership.user &&
      (membership.status === undefined ||
        membership.status?.trim().toUpperCase() ===
          TeamMembershipStatus.ACTIVE),
  );
  const excluded = new Set(project.excludedTeamMemberships ?? []);
  const isOwnerMembership = (membership: (typeof members)[number]) =>
    membership.user._id === project.owner?._id;
  const selectedCount = members.filter(
    (membership) => isOwnerMembership(membership) || !excluded.has(membership._id),
  ).length;

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Selecciona los integrantes con acceso al proyecto y que cuentan en las
        métricas. El creador permanece seleccionado si pertenece al equipo.
        Debe permanecer al menos un integrante seleccionado.
      </p>
      {locked && (
        <p className="text-sm text-muted-foreground">
          Los participantes no se pueden modificar mientras el proyecto esté
          cerrado.
        </p>
      )}
      {!locked && members.length > 0 && selectedCount === 0 && (
        <p className="text-sm text-destructive">
          Selecciona al menos un integrante para el proyecto.
        </p>
      )}
      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay integrantes activos.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {members.map((membership) => (
            <label key={membership._id} className="flex items-center gap-2">
              <Checkbox
                checked={isOwnerMembership(membership) || !excluded.has(membership._id)}
                disabled={locked || mutation.isPending || isOwnerMembership(membership)}
                onCheckedChange={(checked) => {
                  if (checked === false && selectedCount <= 1) {
                    toast.error(
                      'Debe haber al menos un integrante seleccionado en el proyecto.',
                    );
                    return;
                  }
                  mutation.mutate({
                    membershipId: membership._id,
                    selected: checked === true,
                  });
                }}
              />
              <span>
                {membership.user.givenName} {membership.user.familyName}
                {isOwnerMembership(membership) && ' (creador del proyecto)'}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
