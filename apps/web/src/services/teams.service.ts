import { api } from '@/lib/axios';
import { ITeam } from '@repo/types';

const getAllTeams = async (isPrivate?: boolean) => {
  let url;

  if (isPrivate !== undefined) {
    url = `/teams?isPrivate=${isPrivate}`;
  } else {
    url = '/teams';
  }

  const { data } = await api.get(url);
  return data;
};

const getTeam = async (teamId: string) => {
  const { data } = await api.get(`/teams/${teamId}`);
  return data;
};

const getByUser = async () => {
  const { data } = await api.get('/teams/by-user');
  return data;
};

const createTeam = async (
  teamData: Pick<
    ITeam,
    'teamName' | 'summary' | 'grade' | 'isPrivate' | 'division'
  >,
) => {
  const { data } = await api.post('/teams', teamData);
  return data.id; // Return team ID for further member/collaborator addition
};

const updateTeam = async (
  teamId: string,
  teamData: Pick<ITeam, 'teamName' | 'summary' | 'grade' | 'isPrivate'>,
) => {
  const { data } = await api.patch(`/teams/${teamId}`, teamData);
  return data._id;
};

const deleteTeam = async (teamId: string) => {
  const { data } = await api.delete(`/teams/${teamId}`);
  return data;
};

const addMembers = async (teamId: string, collaborators: string[]) => {
  const { data } = await api.post(`/teams/${teamId}/members`, {
    userIds: collaborators,
  });
  return data;
};

const removeMember = async (teamId: string, userId: string) => {
  const { data } = await api.delete(`/teams/${teamId}/members/${userId}`);
  return data;
};

const addCollaborators = async (teamId: string, collaborators: string[]) => {
  const { data } = await api.post(`/teams/${teamId}/collaborators`, {
    userIds: collaborators,
  });
  return data;
};

const removeCollaborator = async (teamId: string, userId: string) => {
  const { data } = await api.delete(`/teams/${teamId}/collaborators/${userId}`);
  return data;
};

const sendJoinRequest = async (teamId: string) => {
  const { data } = await api.post(`/teams/${teamId}/requests`);
  return data;
};

const acceptRequest = async (teamId: string, userId: string) => {
  const { data } = await api.post(`/teams/${teamId}/requests/accept`, {
    userId: userId,
  });
  return data;
};

const rejectRequest = async (teamId: string, userId: string) => {
  const { data } = await api.delete(`/teams/${teamId}/requests/${userId}`);
  return data;
};

export {
  getAllTeams,
  getTeam,
  getByUser,
  createTeam,
  updateTeam,
  deleteTeam,
  addMembers,
  removeMember,
  addCollaborators,
  removeCollaborator,
  sendJoinRequest,
  acceptRequest,
  rejectRequest,
};
