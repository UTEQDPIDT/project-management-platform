import {
  EventType,
  ProjectStatus,
  ProjectValidation,
  TeamsGrade,
  UserType,
} from '@repo/types';

export type AppBadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'blue'
  | 'green'
  | 'gray'
  | 'purple'
  | 'orange';

type BadgePresentation = {
  label: string;
  variant: AppBadgeVariant;
};

const USER_TYPE_BADGE_MAP: Record<UserType, AppBadgeVariant> = {
  [UserType.ADMINISTRATIVO]: 'purple',
  [UserType.MAESTRO]: 'green',
  [UserType.ESTUDIANTE]: 'blue',
};

const TEAM_GRADE_BADGE_MAP: Record<TeamsGrade, AppBadgeVariant> = {
  [TeamsGrade.CA_EN_FORMACION]: 'orange',
  [TeamsGrade.CA_CONSOLIDADO]: 'orange',
  [TeamsGrade.CA_EN_CONSOLIDACION]: 'orange',
  [TeamsGrade.GRUPO_DE_INVESTIGACION]: 'purple',
  [TeamsGrade.SIN_GRADO]: 'gray',
};

const PROJECT_STATUS_BADGE_MAP: Record<ProjectStatus, BadgePresentation> = {
  [ProjectStatus.PENDING]: { label: 'Pendiente', variant: 'gray' },
  [ProjectStatus.IN_PROGRESS]: { label: 'En progreso', variant: 'blue' },
  [ProjectStatus.COMPLETED]: { label: 'Completado', variant: 'green' },
  [ProjectStatus.CLOSED]: { label: 'Cerrado', variant: 'purple' },
};

const PROJECT_VALIDATION_BADGE_MAP: Record<ProjectValidation, BadgePresentation> = {
  [ProjectValidation.UNDER_REVIEW]: {
    label: 'En revisión',
    variant: 'gray',
  },
  [ProjectValidation.FIRST_VALIDATION]: {
    label: 'Aprobado',
    variant: 'green',
  },
  [ProjectValidation.FINAL_VALIDATION]: {
    label: 'Validación final',
    variant: 'purple',
  },
};

const EVENT_TYPE_BADGE_MAP: Partial<Record<EventType, AppBadgeVariant>> = {
  [EventType.EXTERNO]: 'blue',
};

export const getVisibilityBadge = (isPrivate: boolean): BadgePresentation => {
  if (isPrivate) {
    return { label: 'Privado', variant: 'purple' };
  }

  return { label: 'Público', variant: 'blue' };
};

export const getUserTypeBadge = (type: UserType): BadgePresentation => ({
  label: type,
  variant: USER_TYPE_BADGE_MAP[type],
});

export const getTeamGradeBadge = (grade: TeamsGrade): BadgePresentation => ({
  label: grade,
  variant: TEAM_GRADE_BADGE_MAP[grade],
});

export const normalizeProjectStatus = (status?: string): ProjectStatus => {
  const value = (status ?? '').trim().toUpperCase();

  if (value === 'IN_PROGRESS' || value === 'EN PROGRESO' || value === 'PROGRESS') {
    return ProjectStatus.IN_PROGRESS;
  }

  if (value === 'COMPLETED' || value === 'COMPLETADO') {
    return ProjectStatus.COMPLETED;
  }

  if (value === 'FIRST_VALIDATION' || value === 'PRIMERA VALIDACION' || value === 'PRIMERA VALIDACIÓN') {
    return ProjectStatus.COMPLETED;
  }

  if (value === 'CLOSED' || value === 'CERRADO') {
    return ProjectStatus.CLOSED;
  }

  return ProjectStatus.PENDING;
};

export const getProjectStatusBadge = (status?: string): BadgePresentation => {
  const normalizedStatus = normalizeProjectStatus(status);
  return PROJECT_STATUS_BADGE_MAP[normalizedStatus];
};

export const normalizeProjectValidation = (
  validationStatus?: string,
): ProjectValidation => {
  const value = (validationStatus ?? '').trim().toUpperCase();

  if (value === 'FINAL_VALIDATION' || value === 'VALIDACIÓN FINAL' || value === 'VALIDACION FINAL') {
    return ProjectValidation.FINAL_VALIDATION;
  }

  if (value === 'FIRST_VALIDATION' || value === 'PRIMERA VALIDACIÓN' || value === 'PRIMERA VALIDACION') {
    return ProjectValidation.FIRST_VALIDATION;
  }

  return ProjectValidation.UNDER_REVIEW;
};

export const getProjectValidationBadge = (
  validationStatus?: string,
): BadgePresentation => {
  return PROJECT_VALIDATION_BADGE_MAP[normalizeProjectValidation(validationStatus)];
};

export const getEventTypeBadge = (type: EventType): BadgePresentation => ({
  label: type,
  variant: EVENT_TYPE_BADGE_MAP[type] ?? 'green',
});
