'use client';

import ErrorCard from '@/components/error-card';
import { UpdateProjectForm } from '@/components/forms/update-project-form';
import {
  Header,
  HeaderAction,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import LoadingMessage from '@/components/loading-message';
import { PageContent } from '@/components/page-content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProject } from '@/hooks/projects';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const Page = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading, isError } = useProject(projectId);

  return (
    <div>
      <Header>
        <HeaderHeading className="flex-row gap-2">
          <Badge variant="orange">Editando</Badge>
          <HeaderTitle className="line-clamp-1">{project.name}</HeaderTitle>
        </HeaderHeading>
        <HeaderAction>
          <Button asChild variant="ghost">
            <Link href={`/user/proyectos/${projectId}`}>
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
        ) : isError ? (
          <ErrorCard />
        ) : (
          <UpdateProjectForm project={project} />
        )}
      </PageContent>
    </div>
  );
};
export default Page;
