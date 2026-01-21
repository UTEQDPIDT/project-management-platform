import { EntityType } from './enums/entity-type.enum';
import { FilePurpose } from './enums/file-purpose.enum';
import { IUser } from './user.type';

export interface IFile {
  _id: string;
  originalName: string;
  url: string;
  size: number;
  mimetype: string;
  entityId: string;
  entityType: EntityType;
  purpose: FilePurpose;
  owner: IUser;
  gridFsId: string;
  createdAt: Date;
  updatedAt: Date;
}
