'use client';

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
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useProject(id);

  return (
    <div>
      <Header>
        <HeaderHeading className="flex-row gap-2">
          <Badge variant="orange">Editando</Badge>
          <HeaderTitle className="line-clamp-1">{project.name}</HeaderTitle>
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
          <UpdateProjectForm
            _id={id}
            name={project.name}
            summary={project.summary}
            objective={project.objective}
            organization={project.organization}
            trlRating={project.trlRating}
            startDate={project.startDate}
            endDate={project.endDate}
            impactLevel={project.impactLevel}
            knowledgeAreas={project.knowledgeAreas}
            impactAreas={project.impactAreas}
            prioritiesPND={project.prioritiesPND}
            sustainableObjectives={project.sustainableObjectives}
            innovationLines={project.innovationLines}
            team={project.team}
            relatedProjects={project.relatedProjects}
          />
        )}
      </PageContent>
    </div>
  );
};
export default Page;
