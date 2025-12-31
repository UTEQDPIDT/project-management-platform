import { api } from '@/lib/axios';
import { ProjectCleanedData, IProject } from '@repo/types';

const createProject = async (projectData: ProjectCleanedData) => {
  try {
    console.log('PROJECT CLEANED DATA', projectData);
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

/**
 * Products
 */
const createProduct = async ({
  projectId,
  productData,
}: {
  projectId: string;
  productData: any;
}) => {
  try {
    const { data } = await api.post(
      `/projects/${projectId}/products`,
      productData,
    );
    return data;
  } catch (err) {
    console.error('Error creating product', err);
  }
};

const deleteProduct = async ({
  projectId,
  productId,
}: {
  projectId: string;
  productId: string;
}) => {
  try {
    await api.delete(`/projects/${projectId}/products/${productId}`);
  } catch (err) {
    console.error('Error deleting product', err);
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
    const { data } = await api.post(
      `/projects/${projectId}/activities`,
      activityData,
    );
    return data;
  } catch (err) {
    console.error('Error creating activity', err);
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
    await api.delete(`/projects/${projectId}/activities/${activityId}`);
  } catch (err) {
    console.error('Error deleting activity', err);
  }
};

export {
  createProject,
  getAllProjects,
  getProject,
  getByOwner,
  updateProject,
  deleteProject,
  createProduct,
  deleteProduct,
  createActivity,
  deleteActivity,
};
