import { api } from '@/lib/axios';
import { IProject } from '@repo/types';

const createProject = async (
  projectData: Pick<
    IProject,
    | 'name'
    | 'summary'
    | 'objective'
    | 'trlRating'
    | 'organization'
    | 'startDate'
    | 'endDate'
    | 'impactLevel'
    | 'impactAreas'
    | 'knowledgeAreas'
    | 'prioritiesPND'
    | 'innovationLines'
    | 'sustainableObjectives'
    | 'activities'
    | 'team'
    | 'relatedProject'
  >,
) => {
  try {
    const { data } = await api.post('/projects', projectData);
    return data;
  } catch (err) {
    console.error('Error creating project', err);
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

const updateProject = async (id: string, projectData: IProject) => {
  try {
    const { data } = await api.patch(`/projects/${id}`, projectData);
    return data;
  } catch (err) {
    console.error('Error updating project by ID', err);
  }
};

const deleteProject = async (id: string) => {
  try {
    const { data } = await api.delete(`/projects/${id}`);
    return data;
  } catch (err) {
    console.error('Error deleting project by ID', err);
  }
};

export {
  createProject,
  getAllProjects,
  getProject,
  getByOwner,
  updateProject,
  deleteProject,
};
