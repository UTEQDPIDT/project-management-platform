import { Priority } from './enums/priority.enum';
import { Status } from './enums/status.enum';
import { IUser } from './user.type';

export interface IActivity {
  _id: string;
  projectId?: string;
  eventId?: string;
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
  createdAt: Date;
  updatedAt: Date;
}
