import { api } from '@/lib/axios';
import { ProjectCleanedData, IProject } from '@repo/types';

type ProjectsDashboardResponse = {
  period: 'T1' | 'T2' | 'T3';
  year: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  kpis: {
    totalProjects: number;
    studentsInProjects: number;
    teachersInProjects: number;
  };
};

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

const getProjectsDashboard = async (
  period: 'T1' | 'T2' | 'T3',
  year?: number,
): Promise<ProjectsDashboardResponse> => {
  const params: { period: 'T1' | 'T2' | 'T3'; year?: number } = { period };

  if (typeof year === 'number') {
    params.year = year;
  }

  const { data } = await api.get<ProjectsDashboardResponse>('/dashboard/projects', {
    params,
  });

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
  getProjectsDashboard,
};
