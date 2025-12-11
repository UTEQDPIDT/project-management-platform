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
    console.error('Error fetching teams', err);
  }
};

const getTeam = async (teamId: string) => {
  try {
    const { data } = await api.get(`/teams/${teamId}`);
    return data;
  } catch (err) {
    console.error('Error fetching team', err);
  }
};

const createTeam = async (
  teamData: Pick<
    ITeam,
    'teamName' | 'summary' | 'grade' | 'members' | 'collaborators' | 'isPrivate'
  >,
) => {
  try {
    const { data } = await api.post('/teams', teamData);
    return data;
  } catch (err) {
    console.error('Error creating team', err);
  }
};

const updateTeam = async (
  teamId: string,
  teamData: Pick<
    ITeam,
    'teamName' | 'summary' | 'grade' | 'members' | 'collaborators' | 'isPrivate'
  >,
) => {
  try {
    const { data } = await api.patch(`/teams/${teamId}`, teamData);
    return data;
  } catch (err) {
    console.error('Error updating team');
  }
};

const deleteTeam = async (teamId: string) => {
  try {
    const { data } = await api.delete(`/teams/${teamId}`);
    return data;
  } catch (err) {
    console.error('Error deleting team', err);
  }
};

const addMembers = async (teamId: string, collaborators: string[]) => {
  try {
    const { data } = await api.post(
      `/teams/${teamId}/collaborators`,
      collaborators,
    );
  } catch (err) {
    console.error('Error adding collaborators', err);
  }
};

const removeMember = async (teamId: string, userId: string) => {
  try {
    const { data } = await api.delete(`/teams/${teamId}/members/${userId}`);
    return data;
  } catch (err) {
    console.error('Error removing collaborator', err);
  }
};

const addCollaborators = async (teamId: string, collaborators: string[]) => {
  try {
    const { data } = await api.post(
      `/teams/${teamId}/collaborators`,
      collaborators,
    );
  } catch (err) {
    console.error('Error adding collaborators', err);
  }
};

const removeCollaborator = async (teamId: string, userId: string) => {
  try {
    const { data } = await api.delete(
      `/teams/${teamId}/collaborators/${userId}`,
    );
    return data;
  } catch (err) {
    console.error('Error removing collaborator', err);
  }
};

const sendJoinRequest = async (teamId: string) => {
  try {
    const { data } = await api.post(`/teams/${teamId}/requests`);
    return data;
  } catch (err) {
    console.error('Error requesting to join a team', err);
  }
};

const acceptRequest = async (teamId: string, userId: string) => {
  try {
    const { data } = await api.post(`/teams/${teamId}/requests/accept`, {
      userId: userId,
    });
    return data;
  } catch (err) {
    console.error('Error accepting user request', err);
  }
};

const rejectRequest = async (teamId: string, userId: string) => {
  try {
    const { data } = await api.delete(`/teams/${teamId}/requests/${userId}`);
    return data;
  } catch (err) {
    console.error('Error rejecting user request', err);
  }
};

export {
  getAllTeams,
  getTeam,
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
