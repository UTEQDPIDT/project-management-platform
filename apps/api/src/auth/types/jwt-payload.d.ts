import { UserRole } from '../../enums/user-role.enum';

export type AuthJwtPayload = {
  sub: string;
  role: UserRole;
};
