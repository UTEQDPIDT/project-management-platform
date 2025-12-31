'use client';

import { ActivitiesBoard } from '@/components/activities-board';
import {
  Header,
  HeaderAction,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import LoadingMessage from '@/components/loading-message';
import { PageContent } from '@/components/page-content';
import { ProductsBoard } from '@/components/products-board';
import ProjectInfoTable from '@/components/project-info-table';
import { ProjectMenu } from '@/components/project-menu';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useProject } from '@/hooks/projects';
import { Bell } from 'lucide-react';
import { useParams } from 'next/navigation';

const Page = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading: loadingProject } = useProject(id);

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
              <HeaderTitle>{project.name}</HeaderTitle>
            </HeaderHeading>

            <HeaderAction>
              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Bell />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                  <Separator />

                  <div className="px-2 py-3">
                    <span className="text-muted-foreground text-sm">
                      No hay notificaciones
                    </span>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu> */}

              <ProjectMenu projectId={id} name={project.name} />
            </HeaderAction>
          </Header>

          <PageContent className="items-center">
            <ProjectInfoTable
              status={project.status}
              trlRating={project.trlRating}
              objective={project.objective}
              impactLevel={project.impactLevel}
              startDate={project.startDate}
              endDate={project.endDate}
              team={project.team}
              relatedProjects={project.relatedProjects}
              owner={project.owner}
              createdAt={project.createdAt}
              updatedBy={project.updatedBy}
              updatedAt={project.updatedAt}
            />
            <div className="w-full px-4 gap-6 flex flex-col">
              <ActivitiesBoard activities={project.activities} projectId={id} />
              <ProductsBoard products={project.products} projectId={id} />
            </div>
          </PageContent>
        </div>
      )}
    </div>
  );
};
export default Page;
