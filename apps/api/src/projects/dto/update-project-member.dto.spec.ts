import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { UpdateProjectMemberDto } from './update-project-member.dto';

describe('UpdateProjectMemberDto', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
  const metadata = { type: 'body' as const, metatype: UpdateProjectMemberDto };

  it('accepts a membership ID and boolean selection', async () => {
    const body = { membershipId: '507f1f77bcf86cd799439011', selected: false };
    await expect(pipe.transform(body, metadata)).resolves.toMatchObject(body);
  });

  it.each([
    { membershipId: 'invalid', selected: false },
    { membershipId: '507f1f77bcf86cd799439011', selected: 'false' },
    { membershipId: '507f1f77bcf86cd799439011', selected: false, extra: true },
  ])('rejects invalid input %#', async (body) => {
    await expect(pipe.transform(body, metadata)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
