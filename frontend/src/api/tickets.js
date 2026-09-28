import client from './client';

export const getTickets = async (status = null, search = null, priority = null) => {
  const params = {};
  if (status && status !== 'All') params.status = status;
  if (priority && priority !== 'All') params.priority = priority;
  if (search) params.search = search;

  const response = await client.get('/api/tickets', { params });
  return response.data;
};

export const getTicket = async (ticketId) => {
  const response = await client.get(`/api/tickets/${ticketId}`);
  return response.data;
};

export const createTicket = async (data) => {
  const response = await client.post('/api/tickets', data);
  return response.data;
};

export const updateTicket = async (ticketId, data) => {
  const response = await client.put(`/api/tickets/${ticketId}`, data);
  return response.data;
};

export const deleteTicket = async (ticketId) => {
  const response = await client.delete(`/api/tickets/${ticketId}`);
  return response.data;
};
