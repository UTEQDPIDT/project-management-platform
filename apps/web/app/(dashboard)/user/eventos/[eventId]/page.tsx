'use client';

import { ActivityCard } from '@/components/activity-card';
import EventInfoCard from '@/components/event-info-card';
import { EventMenu } from '@/components/event-menu';
import RegisterProductsForm from '@/components/forms/register-product-form';
import { Header, HeaderAction, HeaderHeading } from '@/components/header';
import IconSquare from '@/components/icon-square';
import LoadingMessage from '@/components/loading-message';
import { PageContent } from '@/components/page-content';
import ProductCard from '@/components/product-card';
import { ProfileInfo } from '@/components/profile-info';
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
import { useGetEventById } from '@/hooks/events';
import { IActivity, IProduct, IUser, UserRole } from '@repo/types';
import { userProfile } from 'context/profile-provider';
import { ListTodo, Shapes, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

const Page = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading: loadingEvent } = useGetEventById(eventId);

  /**
   * Context
   */
  const { user } = userProfile();
  const currentUserId = user._id;

  useMemo(() => {
    if (!event?.products || !currentUserId) return [];
    return event.products.filter(
      (p: IProduct) => p.owner._id === currentUserId,
    );
  }, [event?.products, currentUserId]);

  return (
    <div>
      {loadingEvent ? (
        <LoadingMessage />
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
              <div className="w-full max-w-sm flex items-center justify-start flex-col gap-6">
                <EventInfoCard event={event} />

                <Card className="w-full">
                  <CardHeader>
                    <div className="flex justify-between">
                      <div className="flex gap-3 items-center">
                        <IconSquare>
                          <Users />
                        </IconSquare>

                        <CardTitle>Participantes</CardTitle>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {event.participants.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {event.participants.map((p: IUser) => (
                          <div key={p._id} className="flex justify-between">
                            <ProfileInfo
                              size="sm"
                              givenName={p.givenName}
                              familyName={p.familyName}
                              avatarUrl={p.avatarUrl}
                              email={p.email}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Empty>
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <Users />
                          </EmptyMedia>
                          <EmptyTitle>No Hay Participantes</EmptyTitle>
                          <EmptyDescription>
                            No se hay participantes para este evento.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="w-full flex flex-col gap-6">
                <Card className="w-full">
                  <CardHeader>
                    <div className="flex justify-between">
                      <div className="flex gap-3 items-center">
                        <IconSquare>
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
                        <IconSquare>
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
                            projectId={p.projectId}
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
