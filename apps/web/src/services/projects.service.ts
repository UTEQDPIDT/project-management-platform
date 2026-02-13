import { api } from '@/lib/axios';
import { ProjectCleanedData, IProject } from '@repo/types';

const createProject = async (projectData: ProjectCleanedData) => {
  const { data } = await api.post('/projects', projectData);
  return data;
};

const getAllProjects = async () => {
  const { data } = await api.get('/projects');
  return data;
};

const getProject = async (id: string) => {
  const { data } = await api.get(`/projects/${id}`);
  return data;
};

const getByOwner = async () => {
  const { data } = await api.get('/projects/by-owner');
  return data;
};

const getProjectByTeam = async (teamId: string) => {
  const { data } = await api.get(`/projects/by-team/${teamId}`);
  return data;
};

const updateProject = async (id: string, projectData: IProject) => {
  const { data } = await api.patch(`/projects/${id}`, projectData);
  return data;
};

const deleteProject = async (id: string) => {
  const { data } = await api.delete(`/projects/${id}`);
  return data;
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
