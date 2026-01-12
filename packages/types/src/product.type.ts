import { CoAuthor } from './enums/coauthor.enum';
import { IFile } from './file.type';
import { SeedCategory } from './seed-category.type';
import { IUser } from './user.type';

export interface IProduct {
  _id: string;
  projectId: string;
  name: string;
  category: SeedCategory;
  subcategory: SeedCategory;
  details: string;
  coAuthor: CoAuthor;
  owner: IUser;
  file: IFile;
  updatedBy: IUser;
  createdAt: Date;
  updatedAt: Date;
}
