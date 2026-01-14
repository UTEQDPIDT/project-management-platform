import { EntityType } from './enums/entity-type.enum';
import { IFile } from './file.type';

export type UploadMultipleFilesResponse = {
  message: string;
  entityId: string;
  entityType: EntityType;
  files: IFile[];
};
