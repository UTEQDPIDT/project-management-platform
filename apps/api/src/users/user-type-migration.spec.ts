import { UserType } from '@repo/types';
import { createRequire } from 'module';

const { backfillUserTypes } = createRequire(__filename)(
  '../../scripts/backfill-user-types',
) as {
  backfillUserTypes: (
    users: unknown,
    apply: boolean,
  ) => Promise<Record<string, unknown>>;
};

type UserFilter = {
  type: { $ne?: string; $nin?: string[] };
  email?: RegExp;
  $nor?: { email: RegExp }[];
};

describe('user type migration', () => {
  const initialUsers = [
    { email: 'Ana@uteq.edu.mx', type: UserType.ESTUDIANTE },
    { email: ' 123@uteq.edu.mx', type: UserType.MAESTRO },
    { email: 'admin@uteq.edu.mx', type: UserType.ADMINISTRATIVO },
    { email: '_other@uteq.edu.mx', type: UserType.ESTUDIANTE },
    { email: 'teacher@uteq.edu.mx', type: UserType.MAESTRO },
    { email: 'new@uteq.edu.mx', type: undefined },
    { email: undefined, type: undefined },
  ];

  it('previews, preserves administrative and unclassifiable users, and is repeatable', async () => {
    const records = initialUsers.map((user) => ({ ...user }));
    const matches = (user: (typeof records)[number], filter: UserFilter) =>
      (filter.type.$ne === undefined || user.type !== filter.type.$ne) &&
      !(filter.type.$nin ?? []).includes(user.type ?? '') &&
      (!filter.email || filter.email.test(user.email ?? '')) &&
      !(filter.$nor ?? []).some((condition) =>
        condition.email.test(user.email ?? ''),
      );
    const users = {
      countDocuments: jest.fn(
        async (filter: UserFilter) =>
          records.filter((user) => matches(user, filter)).length,
      ),
      updateMany: jest.fn(
        async (filter: UserFilter, update: { $set: { type: UserType } }) => {
          const selected = records.filter((user) => matches(user, filter));
          selected.forEach((user) => {
            user.type = update.$set.type;
          });
          return { modifiedCount: selected.length };
        },
      ),
    };

    expect(await backfillUserTypes(users, false)).toEqual({
      dryRun: true,
      teachers: 2,
      students: 1,
      unclassified: 2,
    });
    expect(users.updateMany).not.toHaveBeenCalled();
    expect(await backfillUserTypes(users, true)).toEqual({
      dryRun: false,
      teachersUpdated: 2,
      studentsUpdated: 1,
      unclassified: 2,
    });
    expect(records.map((user) => user.type)).toEqual([
      UserType.MAESTRO,
      UserType.ESTUDIANTE,
      UserType.ADMINISTRATIVO,
      UserType.ESTUDIANTE,
      UserType.MAESTRO,
      UserType.MAESTRO,
      undefined,
    ]);
    expect(await backfillUserTypes(users, true)).toEqual({
      dryRun: false,
      teachersUpdated: 0,
      studentsUpdated: 0,
      unclassified: 2,
    });
  });
});
