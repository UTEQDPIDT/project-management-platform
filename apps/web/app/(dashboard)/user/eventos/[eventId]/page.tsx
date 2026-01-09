'use client';

import { ActivityCard } from '@/components/activity-card';
import EventInfoCard from '@/components/event-info-card';
import { EventMenu } from '@/components/event-menu';
import EventProductMenu from '@/components/event-product-menu';
import RegisterProductsForm from '@/components/forms/register-product-form';
import { Header, HeaderAction, HeaderHeading } from '@/components/header';
import IconSquare from '@/components/icon-square';
import LoadingMessage from '@/components/loading-message';
import { PageContent } from '@/components/page-content';
import ParticipantsCard from '@/components/participants-card';
import ProductCard from '@/components/product-card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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
import { useGetEventById, useRemoveAssignee } from '@/hooks/events';
import { IActivity, IProduct, IUser, UserRole } from '@repo/types';
import { userProfile } from 'context/profile-provider';
import { ListTodo, Shapes, UserMinus, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useAddAssignee } from '../../../../../src/hooks/events/use-add-assignee';

const Page = () => {
  /**
   * Context
   */
  const { user } = userProfile();
  const currentUserId = user._id;

  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading: loadingEvent } = useGetEventById(eventId);
  const addAssignee = useAddAssignee();
  const removeAssignee = useRemoveAssignee();

  // User products
  useMemo(() => {
    if (!event?.products || !currentUserId) return [];
    return event.products.filter(
      (p: IProduct) => p.owner._id === currentUserId,
    );
  }, [event?.products, currentUserId]);

  return (
    <div>
      {loadingEvent ? (
        <LoadingMessage message="Cargando evento" className="w-full h-screen" />
      ) : (
        <>
          <Header>
            <HeaderHeading>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/user/eventos">Eventos</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>{event.name}</BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </HeaderHeading>
            <HeaderAction>
              <EventMenu eventId={eventId} name={event.name} />
            </HeaderAction>
          </Header>

          <PageContent>
            <div className="w-full flex flex-col lg:flex-row gap-4">
              <div className="w-full lg:max-w-sm flex items-center justify-start flex-col gap-6">
                <EventInfoCard event={event} />
                <ParticipantsCard className="w-full" event={event} />
              </div>

              <div className="w-full flex flex-col gap-6">
                <Card className="w-full">
                  <CardHeader>
                    <div className="flex justify-between">
                      <div className="flex gap-3 items-center">
                        <IconSquare color="green">
                          <ListTodo />
                        </IconSquare>

                        <CardTitle>Actividades</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {event.activities?.length ? (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {event.activities.map((a: IActivity) => (
                          <ActivityCard
                            key={a._id}
                            activity={a}
                            enableOptions={user.role === UserRole.ADMIN}
                            onAction={
                              a.assignees?.some(
                                (a: IUser) => a._id === currentUserId,
                              )
                                ? () =>
                                    removeAssignee.mutate({
                                      activityId: a._id,
                                      userId: currentUserId,
                                    })
                                : () =>
                                    addAssignee.mutate({
                                      activityId: a._id,
                                      userId: currentUserId,
                                    })
                            }
                            buttonText={
                              a.assignees?.some(
                                (a: IUser) => a._id === currentUserId,
                              )
                                ? 'Salir'
                                : 'Participar'
                            }
                            buttonIcon={
                              a.assignees?.some(
                                (a: IUser) => a._id === currentUserId,
                              ) ? (
                                <UserMinus />
                              ) : (
                                <UserPlus />
                              )
                            }
                          />
                        ))}
                      </div>
                    ) : (
                      <Empty>
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <ListTodo />
                          </EmptyMedia>
                          <EmptyTitle>No Hay Actividades</EmptyTitle>
                          <EmptyDescription>
                            No se han agregado actividades para este evento.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    )}
                  </CardContent>
                </Card>

                <Card className="w-full">
                  <CardHeader>
                    <div className="flex justify-between">
                      <div className="flex gap-3 items-center">
                        <IconSquare color="orange">
                          <Shapes />
                        </IconSquare>

                        <CardTitle>Productos</CardTitle>
                      </div>

                      <Dialog>
                        <DialogTrigger className="h-7 px-3 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-transparent">
                          Registrar
                        </DialogTrigger>
                        <DialogContent>
                          <DialogTitle>Registrar Productos</DialogTitle>
                          <Separator />
                          <RegisterProductsForm
                            eventId={eventId}
                            products={event.products}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingEvent ? (
                      <LoadingMessage />
                    ) : event.products.length ? (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {event.products.map((p: IProduct) => (
                          <ProductCard
                            key={p._id}
                            product={p}
                            enableOptions={currentUserId === p.owner._id}
                            options={
                              <EventProductMenu eventId={eventId} product={p} />
                            }
                          />
                        ))}
                      </div>
                    ) : (
                      <Empty>
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <Shapes />
                          </EmptyMedia>
                          <EmptyTitle>No Hay Productos</EmptyTitle>
                          <EmptyDescription>
                            No haz registrado ningún producto para presentar en
                            este evento. Registra tus productos al evento.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </PageContent>
        </>
      )}
    </div>
  );
};

export default Page;
