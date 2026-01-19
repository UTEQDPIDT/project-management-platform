import { EventType } from './enums/event-type.enum';
import { IProduct } from './product.type';
import { IUser } from './user.type';

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
  createdBy: IUser;
  updatedBy: IUser;
  createdAt: Date;
  updatedAt: Date;
}
