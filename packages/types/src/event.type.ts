import { EventType } from './enums/event-type.enum';
import { IProduct } from './product.type';
import { IUser } from './user.type';
import { ProjectValidation } from './enums/project-validation.enum';

export interface IEventAttendance {
  totalParticipants: number;
  men: number;
  women: number;
}

export interface IEvent {
  _id: string;
  name: string;
  summary: string;
  organization?: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  type: EventType;
  participants: IUser[];
  products?: IProduct[];
  isPrivate: boolean;
  acceptsProducts: boolean;
  validationStatus?: ProjectValidation;
  firstValidatedBy?: IUser | null;
  closedBy?: IUser | null;
  attendance?: IEventAttendance;
  createdBy: IUser;
  updatedBy: IUser;
  createdAt: Date;
  updatedAt: Date;
  isHidden?: boolean;
  hiddenBy?: IUser;
}
