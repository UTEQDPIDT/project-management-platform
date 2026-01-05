import { api } from '@/lib/axios';
import { eventSchema } from '@/schemas/event.schema';
import { IEvent } from '@repo/types';
import z from 'zod';

const createEvent = async (eventData: z.infer<typeof eventSchema>) => {
  try {
    await api.post('/events', eventData);
  } catch (err) {
    console.error('Error creating the event', err);
  }
};

const getAllEvents = async () => {
  try {
    const { data } = await api.get('/events');
    return data;
  } catch (err) {
    console.error('Error fetching events', err);
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
    await api.patch(`/events/${eventId}`, eventData);
  } catch (err) {
    console.error('Error updating event', err);
  }
};

const deleteEvent = async (eventId: string) => {
  try {
    await api.delete(`/events/${eventId}`);
  } catch (err) {
    console.error(`Error deleting event with ID ${eventId}`, err);
  }
};

export { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent };
