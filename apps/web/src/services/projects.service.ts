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
    toast.error('El proyecto no ha sido eliminado');
    throw err;
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
};
