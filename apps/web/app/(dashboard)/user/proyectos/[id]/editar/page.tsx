'use client';

import { UpdateTeamForm } from '@/components/forms/update-team-form';
import {
  Header,
  HeaderAction,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import LoadingMessage from '@/components/loading-message';
import { PageContent } from '@/components/page-content';
import { Button } from '@/components/ui/button';
import { useProject } from '@/hooks/projects';
import { useTeam } from '@/hooks/team';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const Page = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useProject(id);

  return (
    <div>
      <Header>
        <HeaderHeading>
          <HeaderTitle>Editar Proyecto</HeaderTitle>
        </HeaderHeading>
        <HeaderAction>
          <Button asChild variant="ghost">
            <Link href={`/user/proyectos/${id}`}>
              <ArrowLeft />
              Cancelar
            </Link>
          </Button>
        </HeaderAction>
      </Header>
      <PageContent className="items-center">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <LoadingMessage />
          </div>
        ) : (
          'Form'
        )}
      </PageContent>
    </div>
  );
};
export default Page;
