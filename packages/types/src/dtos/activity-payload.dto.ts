import { Priority } from '../enums/priority.enum';
import { Status } from '../enums/status.enum';

export type ActivityPayload = {
  name: string;
  status: Status;
  description?: string | undefined;
  priority?: Priority | undefined;
  checked?: boolean | undefined;
  assignees?: string[] | undefined;
  dueDate?: Date | undefined;
  dueDateEnd?: Date | undefined;
};
