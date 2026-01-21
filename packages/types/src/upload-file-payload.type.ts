import { EntityType } from './enums/entity-type.enum';
import { FilePurpose } from './enums/file-purpose.enum';

export type UploadFilePayload = {
  file: File;
  entityId: string;
  entityType: EntityType;
  purpose?: FilePurpose;
};
