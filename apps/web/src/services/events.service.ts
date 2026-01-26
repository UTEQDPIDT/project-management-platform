import { api } from '@/lib/axios';
import { eventSchema } from '@/schemas/event.schema';
import { IEvent } from '@repo/types';
import z from 'zod';

const createEvent = async (eventData: z.infer<typeof eventSchema>) => {
  try {
    const { data } = await api.post('/events', eventData);
    return data;
  } catch (err) {
    throw err;
  }
};

const getAllEvents = async () => {
  try {
    const { data } = await api.get('/events');
    return data;
  } catch (err) {
    throw err;
  }
};

const getEventById = async (eventId: string) => {
  try {
    const { data } = await api.get(`/events/${eventId}`);
    return data;
  } catch (err) {
    throw err;
  }
};

const getEventsByUser = async () => {
  try {
    const { data } = await api.get('/events/by-user');
    return data;
  } catch (err) {
    throw err;
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
    const { data } = await api.patch(`/events/${eventId}`, eventData);
    return data;
  } catch (err) {
    throw err;
  }
};

const deleteEvent = async (eventId: string) => {
  try {
    const { data } = await api.delete(`/events/${eventId}`);
    return data;
  } catch (err) {
    throw err;
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
    const { data } = await api.patch(`/events/${eventId}/products`, products);
    return data;
  } catch (err) {
    throw err;
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
    const { data } = await api.delete(
      `/events/${eventId}/products/${productId}`,
    );
    return data;
  } catch (err) {
    throw err;
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
    const { data } = await api.patch(
      `/events/${eventId}/participants`,
      userIds,
    );
    return data;
  } catch (err) {
    throw err;
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
    const { data } = await api.delete(
      `/events/${eventId}/participants/${userId}`,
    );
    return data;
  } catch (err) {
    throw err;
  }
};

const registerParticipant = async ({ eventId }: { eventId: string }) => {
  try {
    const { data } = await api.patch(`/events/${eventId}/register`);
    return data;
  } catch (err) {
    throw err;
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
  getEventsByUser,
};
