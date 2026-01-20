'use client';

import { ActivitiesBoard } from '@/components/activities-board';
import { CardMembers } from '@/components/card-members';
import ErrorCard from '@/components/error-card';
import FilesCard from '@/components/files-card';
import { Header, HeaderAction, HeaderHeading } from '@/components/header';
import LoadingMessage from '@/components/loading-message';
import { PageContent } from '@/components/page-content';
import { ProductsBoard } from '@/components/products-board';
import { ProjectInfo } from '@/components/project-info';
import { ProjectMenu } from '@/components/project-menu';
import { ProjectsBoard } from '@/components/projects-board';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useActivitiesByEntity } from '@/hooks/activities';
import { useFilesForEntity, useUploadMultipleFiles } from '@/hooks/files';
import { useProductsByProject } from '@/hooks/products';
import { useProject } from '@/hooks/projects';
import { calculateProgress } from '@/lib/utils';
import { EntityType } from '@repo/types';
import { userProfile } from 'context/profile-provider';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

const Page = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { user } = userProfile();

  // Tanstack
  const {
    data: project,
    isLoading: loadingProject,
    isError,
  } = useProject(projectId);
  const {
    data: products,
    isLoading: loadingProducts,
    isError: errorFetchingProducts,
  } = useProductsByProject(projectId);
  const {
    data: activities,
    isLoading: isLoadingActivities,
    isError: isErrorInActivities,
  } = useActivitiesByEntity(projectId);
  const {
    data: savedFiles,
    isLoading: loadingFiles,
    isError: errorFetchingFiles,
  } = useFilesForEntity(projectId);

  // Manage file upload
  const uploadMultipleFiles = useUploadMultipleFiles();
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const handleUpload = () => {
    uploadMultipleFiles.mutate({
      files: filesToUpload,
      entityId: projectId,
      entityType: EntityType.PROJECT,
    });

    setFilesToUpload([]);
  };

  return (
    <div className="w-full h-full">
      {loadingProject ? (
        <div className="w-full h-full flex items-center justify-center">
          <LoadingMessage />
        </div>
      ) : isError ? (
        <ErrorCard />
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
                <ProjectMenu projectId={projectId} name={project.name} />
              )}
            </HeaderAction>
          </Header>

          <PageContent className="items-center">
            {isLoadingActivities ? (
              <LoadingMessage />
            ) : (
              <ProjectInfo
                project={project}
                progress={calculateProgress(activities)}
              />
            )}
            <div className="w-full px-4 gap-6 flex flex-col">
              <ActivitiesBoard
                activities={activities}
                projectId={projectId}
                isLoading={isLoadingActivities}
              />
              <ProductsBoard
                products={products}
                projectId={projectId}
                isLoading={loadingProducts}
                isError={errorFetchingProducts}
              />
              <div className="flex w-full justify-between gap-4">
                {project.team && <CardMembers team={project.team} redirect />}
                {project.relatedProjects && (
                  <ProjectsBoard projects={project.relatedProjects} />
                )}
                {savedFiles && (
                  <FilesCard
                    savedFiles={savedFiles}
                    filesToUpload={filesToUpload}
                    setFilesToUpload={setFilesToUpload}
                    onUpload={handleUpload}
                    isLoading={loadingFiles}
                    isError={errorFetchingFiles}
                    isUploading={uploadMultipleFiles.isPending}
                    accept=".pdf,.doc,.docx,.xlsx"
                  />
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
