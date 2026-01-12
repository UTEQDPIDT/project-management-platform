'use client';

import CardUserInfo from '@/components/card-user-info';
import ErrorCard from '@/components/error-card';
import { Header, HeaderHeading, HeaderTitle } from '@/components/header';
import LoadingMessage from '@/components/loading-message';
import { PageContent } from '@/components/page-content';
import { useUserById } from '@/hooks/user/use-user-by-id';
import { useParams } from 'next/navigation';

const Page = () => {
  const { userId } = useParams<{ userId: string }>();
  const { data: user, isLoading, error } = useUserById(userId);

  return (
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Perfil</HeaderTitle>
        </HeaderHeading>
      </Header>
      <PageContent className="flex flex-col items-center gap-5 py-5">
        {isLoading ? (
          <LoadingMessage message="Cargando perfil" />
        ) : error ? (
          <ErrorCard />
        ) : (
          <CardUserInfo profile={user} />
        )}
      </PageContent>
    </div>
  );
};
export default Page;
