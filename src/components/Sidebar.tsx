import React from 'react';
import { LayoutGrid, Play, Sliders, FileCode, Boxes, ChevronLeft, MessageSquare, Github, BookOpen } from 'lucide-react';
import { ProfileDropdown } from './ProfileDropdown';
import { Tooltip } from './Tooltip';

interface Project {
  id: string;
  name: string;
  lastModified: string;
  description?: string;
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedProject: Project | null;
  onBackToProjects: () => void;
}

export function Sidebar({ activeTab, onTabChange, selectedProject, onBackToProjects }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white h-screen flex flex-col fixed">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Boxes size={20} />
          </div>
          <ProfileDropdown username="avi.aviral140" status="default" />
        </div>

        <nav className="space-y-1">
          {selectedProject ? (
            <button
              onClick={onBackToProjects}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors w-full"
            >
              <ChevronLeft size={18} />
              <span>Back to Apps</span>
            </button>
          ) : (
            <div className="sidebar-item">
              <LayoutGrid size={18} />
              <span>Applications</span>
            </div>
          )}
        </nav>

        {selectedProject && (
          <div className="mt-8">
            <div className="px-4 text-sm font-medium text-gray-500 mb-2">{selectedProject.name}</div>
            <nav className="space-y-1">
              <div
                className={`sidebar-item ${activeTab === 'conversations' ? 'active' : ''} cursor-pointer`}
                onClick={() => onTabChange('conversations')}
              >
                <MessageSquare size={18} />
                <span>Conversations</span>
              </div>
              <div
                className={`sidebar-item ${activeTab === 'executions' ? 'active' : ''} cursor-pointer`}
                onClick={() => onTabChange('executions')}
              >
                <Play size={18} />
                <span>Executions</span>
              </div>
              <div
                className={`sidebar-item ${activeTab === 'params' ? 'active' : ''} cursor-pointer`}
                onClick={() => onTabChange('params')}
              >
                <Sliders size={18} />
                <span>Prompt Configs</span>
              </div>
              <div
                className={`sidebar-item ${activeTab === 'templates' ? 'active' : ''} cursor-pointer`}
                onClick={() => onTabChange('templates')}
              >
                <FileCode size={18} />
                <span>Templates</span>
              </div>
            </nav>
          </div>
        )}
      </div>

      <div className="mt-auto border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="text-blue-600" size={20} />
            <span className="font-semibold text-gray-900">CompextAI</span>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip text="Docs">
              <a
                href="https://compextai.notion.site/Docs-13b5ef52981080b4bdd9dcad34bbc394"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <BookOpen size={18} className="text-white" />
              </a>
            </Tooltip>
            <Tooltip text="Source Code">
              <a
                href="https://github.com/burnerlee/compextAI"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <Github size={18} className="text-white" />
              </a>
            </Tooltip>
          </div>
        </div>
      </div>
    </aside>
  );
}