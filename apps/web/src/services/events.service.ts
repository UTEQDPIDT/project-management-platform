import { api } from '@/lib/axios';
import { eventSchema } from '@/schemas/event.schema';
import { IEvent } from '@repo/types';
import { toast } from 'sonner';
import z from 'zod';

const createEvent = async (eventData: z.infer<typeof eventSchema>) => {
  try {
    const { status } = await api.post('/events', eventData);
    if (status === 200 || status === 201) {
      toast.success('El evento ha sido creado');
    }
  } catch (err) {
    console.error('Error creating the event', err);
    toast.error('No se ha creado el evento');
  }
};

const getAllEvents = async () => {
  try {
    const { data } = await api.get('/events');
    return data;
  } catch (err) {
    console.error('Error fetching events', err);
    toast.error('Error al solicitar eventos');
  }
};

const getEventById = async (eventId: string) => {
  try {
    const { data } = await api.get(`/events/${eventId}`);
    return data;
  } catch (err) {
    console.error(`Error fetching event with ID ${eventId}`, err);
  }
};

const updateEvent = async ({
  eventId,
  eventData,
}: {
  eventId: string;
  eventData: IEvent;
}) => {
  try {
    const { status } = await api.patch(`/events/${eventId}`, eventData);
    if (status === 200) {
      toast.success('Se ha actualizado el evento');
    }
  } catch (err) {
    console.error('Error updating event', err);
    toast.error('No se ha actualizado el evento');
  }
};

const deleteEvent = async (eventId: string) => {
  try {
    const { status } = await api.delete(`/events/${eventId}`);
    if (status === 200) {
      toast.success('Se ha eliminado el evento');
    }
  } catch (err) {
    console.error(`Error deleting event with ID ${eventId}`, err);
    toast.error('No se ha eliminado el evento');
  }
};

/**
 * PRODUCTS
 */
const registerProducts = async ({
  eventId,
  products,
}: {
  eventId: string;
  products: string[];
}) => {
  try {
    const { status } = await api.patch(`/events/${eventId}/products`, products);
    if (status === 200) {
      toast.success('Se agregaron los productos');
    }
  } catch (err) {
    console.error('Error adding products to event');
    toast.error('No se agregaron los productos');
  }
};

const removeProduct = async ({
  eventId,
  productId,
}: {
  eventId: string;
  productId: string;
}) => {
  try {
    const { status } = await api.delete(
      `/events/${eventId}/products/${productId}`,
    );
    if (status === 200) {
      toast.success('Se ha retirado el producto');
    }
  } catch (err) {
    toast.error('No se ha retirado el producto');
    console.error('Error removing product from event');
  }
};

/**
 * PARTICIPANTS
 */
const addParticipants = async ({
  eventId,
  userIds,
}: {
  eventId: string;
  userIds: string[];
}) => {
  try {
    const { status } = await api.patch(
      `/events/${eventId}/participants`,
      userIds,
    );
    if (status === 200) {
      toast.success('Se han agregado participantes');
    }
  } catch (err) {
    console.error('Error adding participants', err);
    toast.error('No se han agregado participantes');
  }
};

const removeParticipant = async ({
  eventId,
  userId,
}: {
  eventId: string;
  userId: string;
}) => {
  try {
    const { status } = await api.delete(
      `/events/${eventId}/participants/${userId}`,
    );
    if (status === 200) {
      toast.success('Se ha expulsado al participante');
    }
  } catch (err) {
    console.error('Error removing participant', err);
    toast.error('No se ha expulsado al participante');
  }
};

const registerParticipant = async ({ eventId }: { eventId: string }) => {
  try {
    const { status } = await api.patch(`/events/${eventId}/register`);

    if (status === 200) {
      toast.success('Se ha registrado al evento');
    }
  } catch (err) {
    console.error('Error registering user');
    toast.error('No se ha registrado el evento');
  }
};

export {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  addParticipants,
  removeParticipant,
  registerParticipant,
  registerProducts,
  removeProduct,
};
