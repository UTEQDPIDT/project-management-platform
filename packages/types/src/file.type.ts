import { IUser } from './user.type';

export interface IFile {
  _id: string;
  name: string;
  url: string;
  size: number;
  mimetype: string;
  owner: IUser;
  gridFsId: string;
  createdAt: Date;
  updatedAt: Date;
}
