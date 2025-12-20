import { IProduct } from '@repo/types';
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';

export default function ProductCard({
  _id,
  name,
  details,
  category,
  subcategory,
  coAuthor,
  owner,
  files,
}: Pick<
  IProduct,
  | '_id'
  | 'name'
  | 'details'
  | 'category'
  | 'subcategory'
  | 'coAuthor'
  | 'owner'
  | 'files'
>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{details}</CardDescription>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
