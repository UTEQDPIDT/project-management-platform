import { api } from '@/lib/axios';
import { eventSchema } from '@/schemas/event.schema';
import { IEvent } from '@repo/types';
import z from 'zod';

const createEvent = async (eventData: z.infer<typeof eventSchema>) => {
  const { data } = await api.post('/events', eventData);
  return data;
};

const getAllEvents = async () => {
  const { data } = await api.get('/events');
  return data;
};

const getEventById = async (eventId: string) => {
  const { data } = await api.get(`/events/${eventId}`);
  return data;
};

const getEventsByUser = async () => {
  const { data } = await api.get('/events/by-user');
  return data;
};

const updateEvent = async ({
  eventId,
  eventData,
}: {
  eventId: string;
  eventData: IEvent;
}) => {
  const { data } = await api.patch(`/events/${eventId}`, eventData);
  return data;
};

const deleteEvent = async (eventId: string) => {
  const { data } = await api.delete(`/events/${eventId}`);
  return data;
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
  const { data } = await api.patch(`/events/${eventId}/products`, products);
  return data;
};

const removeProduct = async ({
  eventId,
  productId,
}: {
  eventId: string;
  productId: string;
}) => {
  const { data } = await api.delete(`/events/${eventId}/products/${productId}`);
  return data;
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
  const { data } = await api.patch(`/events/${eventId}/participants`, userIds);
  return data;
};

const removeParticipant = async ({
  eventId,
  userId,
}: {
  eventId: string;
  userId: string;
}) => {
  const { data } = await api.delete(
    `/events/${eventId}/participants/${userId}`,
  );
  return data;
};

const registerParticipant = async ({ eventId }: { eventId: string }) => {
  const { data } = await api.patch(`/events/${eventId}/register`);
  return data;
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
