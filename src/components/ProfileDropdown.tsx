import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateAuthToken } from '../lib/api-client';

interface ProfileDropdownProps {
  username: string;
  status: string;
}

export function ProfileDropdown({ username, status }: ProfileDropdownProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileSettings = () => {
    setIsOpen(false);
    navigate('/profile/settings');
  };

  const handleLogout = () => {
    setIsOpen(false);
    // Remove token from localStorage
    localStorage.removeItem('api_token');
    // Update API client to remove auth header
    updateAuthToken(null);
    // Navigate to login page
    navigate('/login', { replace: true });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center justify-between">
            <span className="font-medium">{username}</span>
            <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
          <span className="text-sm text-gray-500">{status}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 py-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <button
            onClick={handleProfileSettings}
            className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-50 text-gray-700"
          >
            <Settings size={16} />
            <span>Profile Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-50 text-red-600"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}