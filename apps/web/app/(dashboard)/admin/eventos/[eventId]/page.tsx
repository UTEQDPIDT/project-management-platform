'use client';

import { ActivityCard } from '@/components/activity-card';
import { EventMenu } from '@/components/event-menu';
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

import { ProfileInfo } from '@/components/profile-info';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import {
  useDeleteEventActivity,
  useGetEventById,
  useRemoveParticipant,
} from '@/hooks/events';
import { IActivity, IProduct, IUser } from '@repo/types';
import {
  Download,
  File,
  FileText,
  ListTodo,
  MoreHorizontal,
  Newspaper,
  Shapes,
  Upload,
  UserMinus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const Page = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading: loadingEvent } = useGetEventById(eventId);
  const deleteActivity = useDeleteEventActivity();
  const removeParticipant = useRemoveParticipant();

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
              <EventMenu eventId={eventId} name={event.name} />
            </HeaderAction>
          </Header>

          <PageContent className="px-4">
            <div className="flex gap-6 lg:gap-4 flex-col lg:flex-row">
              <div className="w-full lg:max-w-md flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between">
                      <div className="flex gap-3 items-center">
                        <IconSquare className="bg-purple-50 text-purple-700">
                          <FileText />
                        </IconSquare>

                        <CardTitle>Informe</CardTitle>
                      </div>
                      <Dialog>
                        <DialogTrigger className="h-7 px-3 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-transparent">
                          <Upload />
                          Subir
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
                    {event.report ? (
                      <span>reporte</span>
                    ) : (
                      <Empty>
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <FileText />
                          </EmptyMedia>
                          <EmptyTitle>No Hay Informe</EmptyTitle>
                          <EmptyDescription>
                            No se ha subido el informe del evento. Haz clic en
                            subir para seleccionar un archivo.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex justify-between">
                      <div className="flex gap-3 items-center">
                        <IconSquare className="bg-blue-50 text-blue-700">
                          <Users />
                        </IconSquare>

                        <CardTitle>Participantes</CardTitle>
                      </div>
                      {/* <Dialog>
                        <DialogTrigger className="h-7 px-3 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-transparent">
                          Agregar
                        </DialogTrigger>
                        <DialogContent>
                          <DialogTitle>Participación</DialogTitle>
                          <Separator />
                        </DialogContent>
                      </Dialog> */}
                    </div>
                  </CardHeader>

                  <CardContent>
                    {event.participants.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {event.participants.map((p: IUser) => (
                          <div key={p._id} className="flex justify-between">
                            <ProfileInfo
                              givenName={p.givenName}
                              familyName={p.familyName}
                              avatarUrl={p.avatarUrl}
                              email={p.email}
                            />

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon-sm" variant="ghost">
                                  <MoreHorizontal />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <Button
                                  size="sm"
                                  className="w-full justify-start font-normal bg-transparent hover:text-destructive-foreground"
                                  variant="ghost"
                                  disabled={false}
                                  onClick={() => {
                                    // mutation
                                    console.log('Expular');
                                    removeParticipant.mutate({
                                      eventId,
                                      userId: p._id,
                                    });
                                  }}
                                >
                                  <UserMinus /> Expulsar
                                </Button>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                            No se han agregado participantes al evento. Agrega
                            participantes.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="w-full flex flex-col gap-6">
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
                              No se han agregado actividades para el evento.
                              Crea una nueva actividad.
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
                              No se ha agregado ningún producto. Debes esperar a
                              que los asistentes seleccionen sus productos.
                            </EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      )}
                    </div>
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
