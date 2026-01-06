'use client';

import { ActivityCard } from '@/components/activity-card';
import { ActivityForm } from '@/components/forms/activity-form';
import {
  Header,
  HeaderAction,
  HeaderDescription,
  HeaderHeading,
  HeaderTitle,
} from '@/components/header';
import IconSquare from '@/components/icon-square';
import LoadingMessage from '@/components/loading-message';
import { PageContent } from '@/components/page-content';
import ProductCard from '@/components/product-card';
import { ProductsBoard } from '@/components/products-board';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import { useDeleteEventActivity, useGetEventById } from '@/hooks/events';
import { IActivity, IProduct } from '@repo/types';
import { File, FileText, ListTodo, Newspaper, Shapes } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const Page = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading: loadingEvent } = useGetEventById(eventId);
  const deleteActivity = useDeleteEventActivity();

  const handleDeleteActivity = (activity: IActivity) => {
    deleteActivity.mutate({
      eventId,
      activityId: activity._id,
    });
  };

  return (
    <div>
      {loadingEvent ? (
        <LoadingMessage />
      ) : (
        <>
          <Header>
            <HeaderHeading>
              <HeaderTitle>{event.name}</HeaderTitle>
            </HeaderHeading>
            <HeaderAction>
              <Button asChild>
                <Link href={`/admin/eventos/${eventId}/editar`}>
                  Editar Evento
                </Link>
              </Button>
            </HeaderAction>
          </Header>

          <PageContent className="px-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <div className="flex gap-3 items-center">
                    <IconSquare className="bg-green-50 text-green-700">
                      <ListTodo />
                    </IconSquare>

                    <CardTitle>Actividades</CardTitle>
                  </div>
                  <Dialog>
                    <DialogTrigger className="h-7 px-3 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-transparent">
                      Crear
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle>Nueva Actividad</DialogTitle>
                      <Separator />
                      <ActivityForm eventId={eventId} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {event.activities?.length ? (
                    event.activities.map((a: IActivity) => (
                      <ActivityCard
                        key={a._id}
                        activity={a}
                        onDelete={handleDeleteActivity}
                      />
                    ))
                  ) : (
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <ListTodo />
                        </EmptyMedia>
                        <EmptyTitle>No Hay Actividades</EmptyTitle>
                        <EmptyDescription>
                          No se han agregado actividades para el evento. Crea
                          una nueva actividad.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex gap-3 items-center">
                  <IconSquare className="bg-orange-50 text-orange-700">
                    <Shapes />
                  </IconSquare>

                  <CardTitle>Productos</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="px-4">
                  {event.products.length > 0 ? (
                    event.products.map((p: IProduct) => (
                      <ProductCard
                        key={p._id}
                        product={p}
                        projectId={p.projectId}
                      />
                    ))
                  ) : (
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Shapes />
                        </EmptyMedia>
                        <EmptyTitle>No Hay Productos</EmptyTitle>
                        <EmptyDescription>
                          No se ha agregado ningún producto. Debes esperar a que
                          los asistentes seleccionen sus productos.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </div>
              </CardContent>
            </Card>
          </PageContent>
        </>
      )}
    </div>
  );
};

export default Page;
