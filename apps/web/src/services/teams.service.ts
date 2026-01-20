import { api } from '@/lib/axios';
import { ITeam } from '@repo/types';

const getAllTeams = async (isPrivate?: boolean) => {
  let url;

  if (isPrivate !== undefined) {
    url = `/teams?isPrivate=${isPrivate}`;
  } else {
    url = '/teams';
  }

  try {
    const { data } = await api.get(url);
    return data;
  } catch (err) {
    throw err;
  }
};

const getTeam = async (teamId: string) => {
  try {
    const { data } = await api.get(`/teams/${teamId}`);
    return data;
  } catch (err) {
    throw err;
  }
};

const getByUser = async () => {
  try {
    const { data } = await api.get('/teams/by-user');
    return data;
  } catch (err) {
    throw err;
  }
};

const createTeam = async (
  teamData: Pick<
    ITeam,
    'teamName' | 'summary' | 'grade' | 'isPrivate' | 'division'
  >,
) => {
  try {
    const { data } = await api.post('/teams', teamData);
    return data.id; // Return team ID for further member/collaborator addition
  } catch (err) {
    throw err;
  }
};

const updateTeam = async (
  teamId: string,
  teamData: Pick<ITeam, 'teamName' | 'summary' | 'grade' | 'isPrivate'>,
) => {
  try {
    const { data } = await api.patch(`/teams/${teamId}`, teamData);
    return data._id;
  } catch (err) {
    throw err;
  }
};

const deleteTeam = async (teamId: string) => {
  try {
    const { data } = await api.delete(`/teams/${teamId}`);
    return data;
  } catch (err) {
    throw err;
  }
};

const addMembers = async (teamId: string, collaborators: string[]) => {
  try {
    const { data } = await api.post(`/teams/${teamId}/members`, {
      userIds: collaborators,
    });
    return data;
  } catch (err) {
    throw err;
  }
};

const removeMember = async (teamId: string, userId: string) => {
  try {
    const { data } = await api.delete(`/teams/${teamId}/members/${userId}`);
    return data;
  } catch (err) {
    throw err;
  }
};

const addCollaborators = async (teamId: string, collaborators: string[]) => {
  try {
    const { data } = await api.post(`/teams/${teamId}/collaborators`, {
      userIds: collaborators,
    });
    return data;
  } catch (err) {
    throw err;
  }
};

const removeCollaborator = async (teamId: string, userId: string) => {
  try {
    const { data } = await api.delete(
      `/teams/${teamId}/collaborators/${userId}`,
    );
    return data;
  } catch (err) {
    throw err;
  }
};

const sendJoinRequest = async (teamId: string) => {
  try {
    const { data } = await api.post(`/teams/${teamId}/requests`);
    return data;
  } catch (err) {
    throw err;
  }
};

const acceptRequest = async (teamId: string, userId: string) => {
  try {
    const { data } = await api.post(`/teams/${teamId}/requests/accept`, {
      userId: userId,
    });
    return data;
  } catch (err) {
    throw err;
  }
};

const rejectRequest = async (teamId: string, userId: string) => {
  try {
    const { data } = await api.delete(`/teams/${teamId}/requests/${userId}`);
    return data;
  } catch (err) {
    throw err;
  }
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
