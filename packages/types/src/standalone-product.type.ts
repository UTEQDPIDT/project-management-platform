import { CoAuthor } from './enums/coauthor.enum';
import { SeedCategory } from './seed-category.type';
import { IUser } from './user.type';

export interface IStandaloneProduct {
  _id: string;
  name: string;
  category: SeedCategory;
  subcategory: SeedCategory;
  coAuthor: CoAuthor;
  owner: IUser;
  updatedBy: IUser;
  createdAt: Date;
  updatedAt: Date;
}
