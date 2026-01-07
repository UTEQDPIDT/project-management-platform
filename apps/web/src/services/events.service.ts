import { api } from '@/lib/axios';
import { activityZodSchema } from '@/schemas/activity.schema';
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

/**
 * ACTIVITIES
 */
const createEventActivity = async ({
  eventId,
  activityData,
}: {
  eventId: string;
  activityData: z.infer<typeof activityZodSchema>;
}) => {
  try {
    await api.post(`/events/${eventId}/activities`, activityData);
  } catch (err) {
    console.error('Error creating event activity', err);
  }
};

const deleteEventActivity = async ({
  eventId,
  activityId,
}: {
  eventId: string;
  activityId: string;
}) => {
  try {
    await api.delete(`/events/${eventId}/activities/${activityId}`);
  } catch (err) {
    console.error('Error deleting event activity', err);
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
    await api.patch(`/events/${eventId}/participants`, userIds);
  } catch (err) {
    console.error('Error adding participants', err);
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
    await api.delete(`/events/${eventId}/participants/${userId}`);
  } catch (err) {
    console.error('Error removing participant', err);
  }
};

const registerParticipant = async ({ eventId }: { eventId: string }) => {
  try {
    await api.patch(`/events/${eventId}/register`);
  } catch (err) {
    console.error('Error registering user');
  }
};

export {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  createEventActivity,
  deleteEventActivity,
  addParticipants,
  removeParticipant,
  registerParticipant,
};
