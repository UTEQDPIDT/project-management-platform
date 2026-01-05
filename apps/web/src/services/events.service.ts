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

export { createEvent, getAllEvents, updateEvent };
