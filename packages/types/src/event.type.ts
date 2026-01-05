import { IActivity } from './activity.type';
import { EventType } from './enums/event-type.enum';
import { IFile } from './file.type';
import { IProduct } from './product.type';
import { IUser } from './user.type';

export interface IEvent {
  _id: string;
  name: string;
  summary: string;
  organization: string;
  location: string;
  date: Date;
  report: IFile;
  type: EventType;
  isPrivate: boolean;
  activities?: IActivity[];
  products?: IProduct[];
  createdBy: IUser;
  updatedBy: IUser;
  createdAt: Date;
  updatedAt: Date;
}
