import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, Trash2 } from 'lucide-react';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { projectApi, Project } from '../lib/api/project';

export function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId && !(event.target as Element).closest('.project-dropdown')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectApi.list();
      setProjects(data);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (name: string, description: string) => {
    try {
      setIsCreating(true);
      const newProject = await projectApi.create(name, description);
      setProjects([newProject, ...projects]);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error creating project:', err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteProject) return;

    try {
      setIsDeleting(true);
      await projectApi.delete(deleteProject.identifier);
      setProjects(projects.filter(p => p.identifier !== deleteProject.identifier));
      setDeleteProject(null);
    } catch (err: any) {
      console.error('Error deleting project:', err);
      setError(err.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProjectSelect = (project: Project) => {
    navigate(`/project/${project.name}/conversations`);
  };

  const toggleDropdown = (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenDropdownId(openDropdownId === projectId ? null : projectId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Projects</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Create new app
          </button>
        </div>

        <hr className="border-gray-200 mb-6" />

        <div className="grid grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.identifier}
              className="app-card group"
              onClick={() => handleProjectSelect(project)}
            >
              <div className="app-card-content">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{project.name}</h3>
                    {project.description && (
                      <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                    )}
                  </div>
                  <div className="app-card-actions project-dropdown">
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={(e) => toggleDropdown(project.identifier, e)}
                    >
                      <MoreVertical size={18} className="text-gray-400" />
                    </button>
                    {openDropdownId === project.identifier && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteProject(project);
                            setOpenDropdownId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete Project
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last modified:</span>
                  <span className="text-gray-600">
                    {new Date(project.updated_at).toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
              <div className="app-card-overlay" />
            </div>
          ))}
        </div>

        <CreateProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateProject}
          isCreating={isCreating}
        />

        <DeleteConfirmationModal
          isOpen={!!deleteProject}
          onClose={() => setDeleteProject(null)}
          onConfirm={handleDeleteProject}
          title="Delete Project"
          message={`Are you sure you want to delete the project "${deleteProject?.name}"? This action cannot be undone and will delete all associated data.`}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}