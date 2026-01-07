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
import { Separator } from '@/components/ui/separator';
import { useGetAllUsers } from '@/hooks/user';
import { userProfile } from 'context/profile-provider';
import { Pencil } from 'lucide-react';

const Page = () => {
  const { user } = userProfile();

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
            <DialogTrigger>
              <Pencil /> Editar
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Perfil</DialogTitle>
                <DialogDescription>
                  Edita tu perfil aquí y haz click en guardar cuando termines.
                </DialogDescription>
              </DialogHeader>
              <Separator />
              <div className="max-h-[600px] overflow-y-auto px-2">
                <UserForm profile={user} />
              </div>
            </DialogContent>
          </Dialog>
        </HeaderAction>
      </Header>
      <PageContent className="flex flex-col items-center gap-5 py-5">
        <CardUserInfo />
      </PageContent>
    </div>
  );
};
export default Page;
