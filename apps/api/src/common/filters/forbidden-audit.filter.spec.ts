import { ArgumentsHost, ForbiddenException } from '@nestjs/common';
import { ForbiddenAuditFilter } from './forbidden-audit.filter';
import { AccessDeniedException } from '../security/access-denied.exception';
import { AccessDeniedReason } from '../security/access-denied-reason.enum';

describe('ForbiddenAuditFilter', () => {
  it('returns structured response including requestId and reason', () => {
    const filter = new ForbiddenAuditFilter();

    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });

    const request = {
      method: 'DELETE',
      originalUrl: '/files/123',
      url: '/files/123',
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'jest',
        'x-request-id': 'req-123',
      },
      requestId: 'req-123',
      user: {
        id: 'user-1',
        role: 'USER',
      },
    };

    const host = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({ status }),
      }),
    } as unknown as ArgumentsHost;

    const exception = new AccessDeniedException({
      reason: AccessDeniedReason.FILE_DELETE_NOT_OWNER,
      message: 'You are not allowed to delete this file.',
      resourceType: 'file',
      resourceId: '123',
      actorId: 'user-1',
      actorRole: 'USER',
    });

    const loggerSpy = jest
      .spyOn((filter as any).logger, 'warn')
      .mockImplementation(() => undefined);

    filter.catch(exception as ForbiddenException, host);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({
      statusCode: 403,
      code: 'ACCESS_DENIED',
      message: 'You are not allowed to delete this file.',
      reason: AccessDeniedReason.FILE_DELETE_NOT_OWNER,
      requestId: 'req-123',
    });
    expect(loggerSpy).toHaveBeenCalledTimes(1);
  });
});
