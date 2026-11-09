import { SeedCategory } from './seed-category.type';
import { IUser } from './user.type';
import { ITeam } from './team.type';

export interface IStandaloneProduct {
  _id: string;
  name: string;
  category: SeedCategory;
  subcategory: SeedCategory;
  owner: IUser;
  updatedBy: IUser;
  team?: ITeam;
  createdAt: Date;
  updatedAt: Date;
}
