import { ForbiddenException } from '@nestjs/common';

type AccessDeniedParams = {
  reason: string;
  resourceType: string;
  resourceId?: string;
  actorId?: string;
  actorRole?: string;
  message?: string;
};

export class AccessDeniedException extends ForbiddenException {
  constructor(params: AccessDeniedParams) {
    super({
      code: 'ACCESS_DENIED',
      message: params.message ?? 'Forbidden resource access.',
      reason: params.reason,
      resourceType: params.resourceType,
      resourceId: params.resourceId ?? null,
      actorId: params.actorId ?? null,
      actorRole: params.actorRole ?? null,
    });
  }
}
