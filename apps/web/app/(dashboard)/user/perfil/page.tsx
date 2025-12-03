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
import { PageContent } from '@/components/page-content';
import { ProfileInfo } from '@/components/profile-info';
import { Pencil } from 'lucide-react';
import UserForm from '@/components/forms/user-form';
import { useUser } from '@/hooks/use-user';
import LoadingMessage from '@/components/loading-message';
import CardUserInfo from '@/components/card-user-info';

const Page = () => {
  const { data: profile, isLoading: loadingProfile } = useUser();

  console.log('USER PROFILE', profile);

  return (
    <div>
      <Header>
        <HeaderHeading>
          <ProfileInfo givenName="Aeon Julien" email="example@mail.com" />
        </HeaderHeading>
        <HeaderAction>
          <Button variant={'outline'}>
            <Pencil /> Editar
          </Button>
        </HeaderAction>
      </Header>
      <PageContent className="flex flex-col items-center gap-5 py-5">
        {loadingProfile ? (
          <LoadingMessage message="Cargando Perfil" />
        ) : (
          <CardUserInfo profile={profile} />
        )}

        {/* <UserForm /> */}
      </PageContent>
    </div>
  );
};
export default Page;
