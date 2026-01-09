'use client';

import { ActivitiesBoard } from '@/components/activities-board';
import { CardMembers } from '@/components/card-members';
import { Header, HeaderAction, HeaderHeading } from '@/components/header';
import LoadingMessage from '@/components/loading-message';
import { PageContent } from '@/components/page-content';
import { ProductsBoard } from '@/components/products-board';
import ProjectInfoTable from '@/components/project-info';
import { ProjectMenu } from '@/components/project-menu';
import { ProjectsBoard } from '@/components/projects-board';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useProject } from '@/hooks/projects';
import { calculateProgress } from '@/lib/utils';
import { userProfile } from 'context/profile-provider';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const Page = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading: loadingProject } = useProject(id);

  const { user } = userProfile();

  return (
    <div className="w-full h-full">
      {loadingProject ? (
        <div className="w-full h-full flex items-center justify-center">
          <LoadingMessage />
        </div>
      ) : (
        <div>
          <Header>
            <HeaderHeading>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/user/proyectos">Proyectos</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>{project.name}</BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </HeaderHeading>

            <HeaderAction>
              {user._id === project.owner._id && (
                <ProjectMenu projectId={id} name={project.name} />
              )}
            </HeaderAction>
          </Header>

          <PageContent className="items-center">
            <ProjectInfoTable
              project={project}
              progress={calculateProgress(project.activities)}
            />
            <div className="w-full px-4 gap-6 flex flex-col">
              <ActivitiesBoard activities={project.activities} projectId={id} />
              <ProductsBoard products={project.products} projectId={id} />
              <div className="flex w-full justify-between gap-4">
                {project.team && <CardMembers team={project.team} redirect />}
                {project.relatedProjects && (
                  <ProjectsBoard projects={project.relatedProjects} />
                )}
              </div>
            </div>
          </PageContent>
        </div>
      )}
    </div>
  );
};
export default Page;
