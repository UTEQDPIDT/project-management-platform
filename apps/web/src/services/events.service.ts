import { api } from '@/lib/axios';

const getAllEvents = async () => {
  try {
    const { data } = await api.get('/events');
    return data;
  } catch (err) {
    console.error('Error fetching events', err);
  }
};

export { getAllEvents };
