import { api } from '@/lib/axios';
import { toast } from 'sonner';
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

const getByUser = async () => {
  try {
    const { data } = await api.get('/teams/by-user');
    return data;
  } catch (err) {
    console.error('Error fetching team by user', err);
  }
};

const createTeam = async (
  teamData: Pick<ITeam, 'teamName' | 'summary' | 'grade' | 'isPrivate' | 'division'>
) => {
  try {
    const { status, data } = await api.post('/teams', teamData);
    if (status === 200 || status === 201 || status === 202) {
      toast.success('El equipo ha sido creado');
      return data.id; // Return team ID for further member/collaborator addition
    }
  } catch (err) {
    console.error('Error creating team', err);
    toast.error('No se creo el equipo');
  }
};

const updateTeam = async (
  teamId: string,
  teamData: Pick<ITeam, 'teamName' | 'summary' | 'grade' | 'isPrivate'>,
) => {
  try {
    const { status } = await api.patch(`/teams/${teamId}`, teamData);

    if (status === 200 || status === 201 || status === 202) {
      toast.success('El equipo ha sido actualizado');
    }
  } catch (err) {
    console.error('Error updating team');
    toast.error('No se actualizó el equipo');
  }
};

const deleteTeam = async (teamId: string) => {
  try {
    const { status } = await api.delete(`/teams/${teamId}`);
    if (status === 200 || status === 201 || status === 202) {
      toast.success('El equipo ha sido eliminado');
    }
  } catch (err) {
    console.error('Error deleting team', err);
    toast.error('El equipo no ha sido eliminado');
  }
};

const addMembers = async (teamId: string, collaborators: string[]) => {
  try {
    const { status } = await api.post(
      `/teams/${teamId}/members`,
      { userIds: collaborators },
    );
    if (status === 200 || status === 201 || status === 202) {
      toast.success('Miembros agregados');
    }
  } catch (err) {
    console.error('Error adding members', err);
    toast.error('No se agregaron los miembros');
  }
};

const removeMember = async (teamId: string, userId: string) => {
  try {
    const { status } = await api.delete(`/teams/${teamId}/members/${userId}`);
    if (status === 200 || status === 201 || status === 202) {
      toast.success('El miembro ha sido expulsado del equipo');
    }
  } catch (err) {
    console.error('Error removing collaborator', err);
    toast.error('No se expulsó al miembro');
  }
};

const addCollaborators = async (teamId: string, collaborators: string[]) => {
  try {
    const { status } = await api.post(
      `/teams/${teamId}/collaborators`,
      { userIds: collaborators },
    );
    if (status === 200 || status === 201 || status === 202) {
      toast.success('Colaboradores agregados');
    }
  } catch (err) {
    console.error('Error adding collaborators', err);
    toast.error('No se agregaron los colaboradores');
  }
};

const removeCollaborator = async (teamId: string, userId: string) => {
  try {
    const { status } = await api.delete(
      `/teams/${teamId}/collaborators/${userId}`,
    );
    if (status === 200 || status === 201 || status === 202) {
      toast.success('El colaborador ha sido expulsado del equipo');
    }
  } catch (err) {
    console.error('Error removing collaborator', err);
    toast.error('No se expulsó al colaborador');
  }
};

const sendJoinRequest = async (teamId: string) => {
  try {
    const { status } = await api.post(`/teams/${teamId}/requests`);
    if (status === 200 || status === 201 || status === 202) {
      toast.success('Solicitud enviada');
    }
  } catch (err) {
    console.error('Error requesting to join a team', err);
  }
};

const acceptRequest = async (teamId: string, userId: string) => {
  try {
    const { status } = await api.post(`/teams/${teamId}/requests/accept`, {
      userId: userId,
    });

    if (status === 200 || status === 201 || status === 202) {
      toast.success('Solicitud aceptada');
    }
  } catch (err) {
    console.error('Error accepting user request', err);
  }
};

const rejectRequest = async (teamId: string, userId: string) => {
  try {
    const { status } = await api.delete(`/teams/${teamId}/requests/${userId}`);

    if (status === 200 || status === 201 || status === 202) {
      toast.success('Solicitud rechazada');
    }
  } catch (err) {
    console.error('Error rejecting user request', err);
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
