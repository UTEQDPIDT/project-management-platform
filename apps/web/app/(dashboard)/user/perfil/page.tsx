'use client';

import CardUserInfo from '@/components/card-user-info';
import UserForm from '@/components/forms/user-form';
import {
  Header,
  HeaderAction,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import LoadingMessage from '@/components/loading-message';
import { PageContent } from '@/components/page-content';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useUser } from '@/hooks/user';
import { Pencil } from 'lucide-react';

const Page = () => {
  const { data: profile, isLoading: loadingProfile } = useUser();

  console.log('USER PROFILE', profile);

  return (
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Perfil</HeaderTitle>
          <HeaderDescription>
            Visualiza y gestiona la Información de tu perfil.
          </HeaderDescription>
        </HeaderHeading>
        <HeaderAction>
          <Dialog>
            {!loadingProfile && (
              <DialogTrigger>
                <Pencil /> Editar
              </DialogTrigger>
            )}
            <DialogContent className="max-h-[800px] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Perfil</DialogTitle>
                <DialogDescription>
                  Edita tu perfil aquí. Haz click en guardar cuando termines.
                </DialogDescription>
              </DialogHeader>
              <UserForm profile={profile} />
            </DialogContent>
          </Dialog>
        </HeaderAction>
      </Header>
      <PageContent className="flex flex-col items-center gap-5 py-5">
        {loadingProfile ? (
          <LoadingMessage message="Cargando Perfil" />
        ) : (
          <CardUserInfo profile={profile} />
        )}
      </PageContent>
    </div>
  );
};
export default Page;
