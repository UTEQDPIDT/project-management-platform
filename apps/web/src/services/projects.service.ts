import { api } from '@/lib/axios';
import { ProjectCleanedData, IProject } from '@repo/types';
import { toast } from 'sonner';

const createProject = async (projectData: ProjectCleanedData) => {
  try {
    const { status } = await api.post('/projects', projectData);

    if (status === 200 || status === 201 || status === 202) {
      toast.success('El proyecto ha sido creado');
    }
  } catch (err) {
    console.error('Error creating project', err);
    toast.error('El proyecto no ha sido creado');
  }
};

const getAllProjects = async () => {
  try {
    const { data } = await api.get('/projects');
    return data;
  } catch (err) {
    console.error('Error fetching all projects', err);
  }
};

const getProject = async (id: string) => {
  try {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  } catch (err) {
    console.error('Error fetching project by ID', err);
  }
};

const getByOwner = async () => {
  try {
    const { data } = await api.get('/projects/by-owner');
    return data;
  } catch (err) {
    console.error('Error fetching projects by owner', err);
  }
};

const getProjectByTeam = async (teamId: string) => {
  try {
    const { data } = await api.get(`/projects/by-team/${teamId}`);
    return data;
  } catch (err) {
    console.error('Error fetching projects by team', err);
  }
};

const updateProject = async (id: string, projectData: IProject) => {
  try {
    const { status } = await api.patch(`/projects/${id}`, projectData);
    if (status === 200 || status === 201 || status === 202) {
      toast.success('El proyecto ha sido actualizado');
    }
  } catch (err) {
    console.error('Error updating project by ID', err);
    toast.error('No se actualizó el proyecto');
  }
};

const deleteProject = async (id: string) => {
  try {
    const { status } = await api.delete(`/projects/${id}`);
    if (status === 200 || status === 201 || status === 202) {
      toast.success('El proyecto ha sido eliminado');
    }
  } catch (err) {
    console.error('Error deleting project by ID', err);
    toast.error('El proyecto no ha sido eliminado');
  }
};

/**
 * Activities
 */
const createActivity = async ({
  projectId,
  activityData,
}: {
  projectId: string;
  activityData: any;
}) => {
  try {
    const { status } = await api.post(
      `/projects/${projectId}/activities`,
      activityData,
    );

    if (status === 200 || status === 201 || status === 202) {
      toast.success('La actividad ha sido creada');
    }
  } catch (err) {
    console.error('Error creating activity', err);
    toast.error('No se ha creado la actividad');
  }
};

const deleteActivity = async ({
  projectId,
  activityId,
}: {
  projectId: string;
  activityId: string;
}) => {
  try {
    const { status } = await api.delete(
      `/projects/${projectId}/activities/${activityId}`,
    );

    if (status === 200 || status === 201 || status === 202) {
      toast.success('La actividad ha sido eliminada');
    }
  } catch (err) {
    console.error('Error deleting activity', err);
    toast.error('No se ha eliminado la actividad');
  }
};

export {
  createProject,
  getAllProjects,
  getProject,
  getByOwner,
  getProjectByTeam,
  updateProject,
  deleteProject,
  createActivity,
  deleteActivity,
};
