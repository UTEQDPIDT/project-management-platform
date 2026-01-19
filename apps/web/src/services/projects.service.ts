import { api } from '@/lib/axios';
import { ProjectCleanedData, IProject } from '@repo/types';

const createProject = async (projectData: ProjectCleanedData) => {
  try {
    const { data } = await api.post('/projects', projectData);
    return data;
  } catch (err) {
    throw err;
  }
};

const getAllProjects = async () => {
  try {
    const { data } = await api.get('/projects');
    return data;
  } catch (err) {
    throw err;
  }
};

const getProject = async (id: string) => {
  try {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  } catch (err) {
    throw err;
  }
};

const getByOwner = async () => {
  try {
    const { data } = await api.get('/projects/by-owner');
    return data;
  } catch (err) {
    throw err;
  }
};

const getProjectByTeam = async (teamId: string) => {
  try {
    const { data } = await api.get(`/projects/by-team/${teamId}`);
    return data;
  } catch (err) {
    throw err;
  }
};

const updateProject = async (id: string, projectData: IProject) => {
  try {
    const { data } = await api.patch(`/projects/${id}`, projectData);
    return data;
  } catch (err) {
    throw err;
  }
};

const deleteProject = async (id: string) => {
  try {
    const { data } = await api.delete(`/projects/${id}`);
    return data;
  } catch (err) {
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
