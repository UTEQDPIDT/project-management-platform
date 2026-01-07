'use client';

import {
  Header,
  HeaderAction,
  HeaderContent,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import { Button } from '@/components/ui/button';
import { userProfile } from 'context/profile-provider';
import React from 'react';

const Page = () => {
  const { user } = userProfile();

  return (
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Dashboard</HeaderTitle>
          <HeaderDescription>Bienvenido {user.givenName}</HeaderDescription>
        </HeaderHeading>
      </Header>
    </div>
  );
};
export default Page;
