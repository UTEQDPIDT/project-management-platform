import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ForbiddenResponseBody = {
  code?: string;
  message?: string;
  reason?: string;
  resourceType?: string;
  resourceId?: string | null;
  actorId?: string | null;
  actorRole?: string | null;
};

@Catch(ForbiddenException)
export class ForbiddenAuditFilter implements ExceptionFilter {
  private readonly logger = new Logger(ForbiddenAuditFilter.name);

  catch(exception: ForbiddenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request & { requestId?: string; user?: { id?: string; role?: string } }>();
    const response = ctx.getResponse<Response>();

    const exceptionResponse = exception.getResponse();
    const payload: ForbiddenResponseBody =
      typeof exceptionResponse === 'object'
        ? (exceptionResponse as ForbiddenResponseBody)
        : { message: String(exceptionResponse) };

    const requestIdHeader = request.headers['x-request-id'];
    const requestId =
      request.requestId ??
      (Array.isArray(requestIdHeader) ? requestIdHeader[0] : requestIdHeader) ??
      null;

    const logPayload = {
      event: 'access_denied',
      statusCode: HttpStatus.FORBIDDEN,
      path: request.originalUrl ?? request.url,
      method: request.method,
      requestId,
      actorId: request.user?.id ?? payload.actorId ?? null,
      actorRole: request.user?.role ?? payload.actorRole ?? null,
      resourceType: payload.resourceType ?? null,
      resourceId: payload.resourceId ?? null,
      reason: payload.reason ?? 'forbidden',
      message: payload.message ?? exception.message,
      ip: request.ip,
      userAgent: request.headers['user-agent'] ?? null,
      timestamp: new Date().toISOString(),
    };

    this.logger.warn(JSON.stringify(logPayload));

    response.status(HttpStatus.FORBIDDEN).json({
      statusCode: HttpStatus.FORBIDDEN,
      code: payload.code ?? 'FORBIDDEN',
      message: payload.message ?? 'Forbidden',
      reason: payload.reason ?? 'forbidden',
      requestId,
    });
  }
}
