import { EntityType } from './enums/entity-type.enum';

export type UploadFilePayload = {
  file: File;
  entityId: string;
  entityType: EntityType;
};
