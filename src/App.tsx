import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams, useNavigate } from 'react-router-dom';
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
import { LandingPage } from './pages/LandingPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { projectApi, Project, ApiError } from './lib/api-client';

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('api_token');
  const location = useLocation();
  
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated and tries to access the landing page, redirect to projects
  if (location.pathname === '/') {
    return <Navigate to="/projects" replace />;
  }

  return children;
}

function ProjectDashboard() {
  const navigate = useNavigate();
  const { projectName, tab = 'conversations', templateId } = useParams();
  const [activeTab, setActiveTab] = useState(templateId ? 'templates' : tab);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectName) {
      fetchProject();
    }
  }, [projectName]);

  useEffect(() => {
    setActiveTab(templateId ? 'templates' : tab);
  }, [tab, templateId]);

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const projects = await projectApi.list();
      const project = projects.find(p => p.name === projectName);
      if (project) {
        setSelectedProject(project);
      } else {
        setError('Project not found');
      }
    } catch (err) {
      const apiError = err as ApiError;
      console.error('Error fetching project:', apiError);
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToProjects = () => {
    navigate('/projects');
    setSelectedProject(null);
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    if (selectedProject) {
      navigate(`/project/${selectedProject.name}/${newTab}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          selectedProject={selectedProject}
          onBackToProjects={handleBackToProjects}
        />
        <main className="flex-1 pl-64">
          <div className="p-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          selectedProject={selectedProject}
          onBackToProjects={handleBackToProjects}
        />
        <main className="flex-1 pl-64">
          <div className="p-8">
            <div className="flex justify-center items-center h-64">
              <div className="text-red-600">{error}</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!selectedProject) {
    return <Navigate to="/projects" replace />;
  }

  const renderContent = () => {
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
        onTabChange={handleTabChange} 
        selectedProject={selectedProject}
        onBackToProjects={handleBackToProjects}
      />
      <main className="flex-1 pl-64">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/projects"
          element={
            <RequireAuth>
              <ProjectsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/project/:projectName"
          element={
            <RequireAuth>
              <Navigate to="conversations" replace />
            </RequireAuth>
          }
        />
        <Route
          path="/project/:projectName/:tab"
          element={
            <RequireAuth>
              <ProjectDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/project/:projectName/templates/:templateId"
          element={
            <RequireAuth>
              <ProjectDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/project/:projectName/executions/:executionId"
          element={
            <RequireAuth>
              <ExecutionView />
            </RequireAuth>
          }
        />
        <Route
          path="/project/:projectName/threads/:threadId"
          element={
            <RequireAuth>
              <ThreadView />
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
}