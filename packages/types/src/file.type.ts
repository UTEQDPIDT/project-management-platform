import { FileOwnerType } from './enums/file-owner-type.enum';
import { IUser } from './user.type';

export interface IFile {
  _id: string;
  originalName: string;
  url: string;
  size: number;
  mimetype: string;
  ownerId: string;
  ownerType: FileOwnerType;
  uploadedBy: IUser;
  gridFsId: string;
  createdAt: Date;
  updatedAt: Date;
}
