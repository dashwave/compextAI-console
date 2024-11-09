import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Plus, MoreVertical } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ProfileSettings } from './components/ProfileSettings';
import { CreateProjectModal } from './components/CreateProjectModal';
import { ConversationsTab } from './components/ConversationsTab';
import { ExecutionsTab } from './components/ExecutionsTab';
import { ParamsTab } from './components/ParamsTab';
import { TemplatesTab } from './components/TemplatesTab';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ExecutionView } from './pages/ExecutionView';
import { ThreadView } from './pages/ThreadView';
import { projectApi, Project, ApiError } from './lib/api-client';

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('api_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState('conversations');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    // Set active tab based on location state
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectApi.list();
      setProjects(data);
    } catch (err) {
      const apiError = err as ApiError;
      console.error('Error fetching projects:', apiError);
      setError(apiError.message);
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
    } catch (err) {
      const apiError = err as ApiError;
      console.error('Error creating project:', apiError);
      throw apiError;
    } finally {
      setIsCreating(false);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setActiveTab('conversations');
  };

  const renderContent = () => {
    if (!selectedProject) {
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
        <div className="grid grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.identifier}
              className="app-card cursor-pointer"
              onClick={() => handleProjectSelect(project)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium">{project.name}</h3>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <MoreVertical size={18} />
                </button>
              </div>
              {project.description && (
                <p className="text-gray-600 text-sm mb-4">{project.description}</p>
              )}
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
          ))}
        </div>
      );
    }

    switch (activeTab) {
      case 'conversations':
        return <ConversationsTab project={selectedProject} />;
      case 'executions':
        return <ExecutionsTab project={selectedProject} />;
      case 'params':
        return <ParamsTab project={selectedProject} />;
      case 'templates':
        return <TemplatesTab project={selectedProject} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        selectedProject={selectedProject}
        onBackToProjects={() => setSelectedProject(null)}
      />

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">
            {selectedProject ? selectedProject.name : 'Projects'}
          </h1>
          {!selectedProject && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Create new app
            </button>
          )}
        </div>

        {!selectedProject && <hr className="border-gray-200 mb-6" />}

        {renderContent()}

        <CreateProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateProject}
          isCreating={isCreating}
        />
      </main>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/profile/settings"
          element={
            <RequireAuth>
              <ProfileSettings />
            </RequireAuth>
          }
        />
        <Route path="/executions/:executionId" element={<ExecutionView />} />
        <Route path="/threads/:threadId" element={<ThreadView />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}