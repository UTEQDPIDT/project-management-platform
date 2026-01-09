import { api } from '@/lib/axios';
import { ProjectCleanedData, IProject } from '@repo/types';
import { toast } from 'sonner';

const createProject = async (projectData: ProjectCleanedData) => {
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
    const { status } = await api.post(
      `/projects/${projectId}/products`,
      productData,
    );

    if (status === 200 || status === 201 || status === 202) {
      toast.success('Se ha creado el producto');
    }
  } catch (err) {
    console.error('Error creating product', err);
    toast.error('No se ha creado el producto');
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
    const { status } = await api.delete(
      `/projects/${projectId}/products/${productId}`,
    );

    if (status === 200 || status === 201 || status === 202) {
      toast.success('Se elimino producto');
    }
  } catch (err) {
    console.error('Error deleting product', err);
    toast.error('No se elimino el producto');
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
  getProjectByTeam,
  updateProject,
  deleteProject,
  createProduct,
  deleteProduct,
  createActivity,
  deleteActivity,
};
