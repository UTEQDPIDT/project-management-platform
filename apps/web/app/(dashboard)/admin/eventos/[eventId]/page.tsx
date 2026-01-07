'use client';

import { ActivityCard } from '@/components/activity-card';
import { EventMenu } from '@/components/event-menu';
import { ActivityForm } from '@/components/forms/activity-form';
import { ParticipantsForm } from '@/components/forms/participants-form';
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import {
  useDeleteEventActivity,
  useGetEventById,
  useRemoveParticipant,
} from '@/hooks/events';
import { IActivity, IProduct, IUser } from '@repo/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Copy,
  Download,
  File,
  FileText,
  Info,
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
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/admin/eventos">Eventos</Link>
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

          <PageContent className="px-4">
            <div className="flex gap-6 lg:gap-4 flex-col lg:flex-row">
              <div className="w-full lg:max-w-sm flex flex-col gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between">
                      <div className="flex gap-3 items-center">
                        <IconSquare>
                          <Info />
                        </IconSquare>

                        <CardTitle>Acerca del Evento</CardTitle>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex flex-col text-sm gap-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nombre</span>
                        <span>{event.name}</span>
                      </div>

                      <div className="flex justify-between gap-5">
                        <span className="text-muted-foreground">
                          Organización
                        </span>
                        <span>{event.organization}</span>
                      </div>

                      <div className="flex justify-between gap-5">
                        <span className="text-muted-foreground">Resumen</span>
                        <span>{event.summary}</span>
                      </div>

                      <div className="flex justify-between gap-5">
                        <span className="text-muted-foreground">Ubicación</span>
                        <div className="relative group text-right">
                          <span>{event.location}</span>
                          <Button
                            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100"
                            variant="outline"
                            title="Copiar"
                            size="icon-xs"
                            onClick={() =>
                              navigator.clipboard.writeText(event.location)
                            }
                          >
                            <Copy />
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Fecha</span>
                        {event.endDate ? (
                          <div>
                            {format(event.startDate, "d 'de' MMMM 'al' ", {
                              locale: es,
                            })}
                            {format(event.endDate, "d 'de' MMMM 'del' yyyy", {
                              locale: es,
                            })}
                          </div>
                        ) : (
                          <div>
                            {format(event.startDate, "d',' MMM 'del' yyyy", {
                              locale: es,
                            })}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Reporte</span>
                        {event.report ? (
                          <span>reporte</span>
                        ) : (
                          <Button size="sm" variant="outline">
                            <Upload />
                            Subir
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex justify-between">
                      <div className="flex gap-3 items-center">
                        <IconSquare>
                          <Users />
                        </IconSquare>

                        <CardTitle>Participantes</CardTitle>
                      </div>
                      <Dialog>
                        <DialogTrigger className="h-7 px-3 hover:bg-secondary/90 border">
                          Gestionar
                        </DialogTrigger>
                        <DialogContent>
                          <DialogTitle>Participantes</DialogTitle>
                          <Separator />
                          <ParticipantsForm
                            eventId={eventId}
                            participants={event.participants}
                          />
                        </DialogContent>
                      </Dialog>
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
                        <IconSquare>
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
                      <IconSquare>
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
