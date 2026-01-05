import { api } from '@/lib/axios';
import { eventSchema } from '@/schemas/event.schema';
import { IEvent } from '@repo/types';
import z from 'zod';

const createEvent = async (eventData: z.infer<typeof eventSchema>) => {
  try {
    const { data } = await api.post('/events', eventData);
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

export { createEvent, getAllEvents };
