import { api } from '@/lib/axios';
import { DashboardPeriod, ProjectCleanedData, IProject } from '@repo/types';

type ProjectsDashboardResponse = {
  period: DashboardPeriod;
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
  period: DashboardPeriod,
  year?: number,
): Promise<ProjectsDashboardResponse> => {
  const params: { period: DashboardPeriod; year?: number } = { period };

  if (typeof year === 'number') {
    params.year = year;
  }

  const { data } = await api.get<ProjectsDashboardResponse>('/dashboard/projects', {
    params,
  });

  return data;
};

// =========================================================================
// PROJECT VALIDATION FLOW SERVICES (Simplified 2-Step Flow)
// =========================================================================

/**
 * Sends a request to apply the first administrative validation.
 * @param id The unique identifier of the project.
 */
const applyFirstValidation = async (id: string) => {
  const { data } = await api.post(`/projects/${id}/first-validation`);
  return data;
};

/**
 * Sends a request to cancel the first administrative validation.
 * @param id The unique identifier of the project.
 */
const cancelFirstValidation = async (id: string) => {
  const { data } = await api.post(`/projects/${id}/cancel-first-validation`);
  return data;
};

/**
 * Sends a request to close the project permanently (final validation).
 * @param id The unique identifier of the project.
 */
const closeProject = async (id: string) => {
  const { data } = await api.post(`/projects/${id}/close`);
  return data;
};

/**
 * Sends a request to reopen a closed project.
 * @param id The unique identifier of the project.
 */
const reopenProject = async (id: string) => {
  const { data } = await api.post(`/projects/${id}/reopen`);
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
  applyFirstValidation,
  cancelFirstValidation,
  closeProject,
  reopenProject,
};