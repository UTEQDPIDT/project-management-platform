import { EntityType } from './enums/entity-type.enum';
import { Priority } from './enums/priority.enum';
import { Status } from './enums/status.enum';
import { IUser } from './user.type';

export interface IActivity {
  _id: string;
  name: string;
  description?: string;
  priority?: Priority;
  status: Status;
  checked?: boolean;
  assignees?: IUser[];
  createdBy: IUser;
  updatedBy?: IUser;
  dueDate?: Date;
  dueDateEnd?: Date;
  entityId: string;
  entityType: EntityType;
  createdAt: Date;
  updatedAt: Date;
}
