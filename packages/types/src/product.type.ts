import { CoAuthor } from './enums/coauthor.enum';
import { IFile } from './file.type';
import { IUser } from './user.type';

export interface IProduct {
  _id: string;
  name: string;
  category: string;
  subcategory: string;
  details: string;
  coAuthor: CoAuthor;
  owner: IUser;
  files: IFile[];
}
