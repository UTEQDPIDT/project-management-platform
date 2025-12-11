import { IUser } from './user.type';

export interface IResolvedEmail {
  _id: string | null;
  email: string;
  user: IUser;
}
