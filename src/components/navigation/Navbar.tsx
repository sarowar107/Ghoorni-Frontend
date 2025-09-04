import React, { Fragment } from 'react';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';
import { Sun, Moon, Menu, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from '../notifications/NotificationDropdown';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-dark-surface shadow-sm flex items-center justify-between px-6 flex-shrink-0 z-10 border-b border-gray-200 dark:border-dark-border">
      <button onClick={onMenuClick} className="lg:hidden text-gray-600 dark:text-dark-text-secondary">
        <Menu size={24} />
      </button>
      <div className="flex-1 lg:flex-none">
        {/* Can add breadcrumbs or page title here */}
      </div>
      <div className="flex items-center gap-4">
        <NotificationDropdown />
        
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <HeadlessMenu as="div" className="relative">
          <div>
            <HeadlessMenu.Button className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border p-2 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="font-semibold">{user?.name}</span>
                <span className="text-xs text-gray-500 dark:text-dark-text-secondary">{user?.role}</span>
              </div>
              <ChevronDown size={16} className="hidden md:block" />
            </HeadlessMenu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <HeadlessMenu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-dark-surface divide-y divide-gray-100 dark:divide-dark-border rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-1 py-1">
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => navigate('/profile')}
                      className={`${
                        active ? 'bg-cuet-primary-900 text-white' : 'text-gray-900 dark:text-dark-text'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      <User className="mr-2 h-5 w-5" />
                      Profile
                    </button>
                  )}
                </HeadlessMenu.Item>
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => navigate('/profile/notifications')}
                      className={`${
                        active ? 'bg-cuet-primary-900 text-white' : 'text-gray-900 dark:text-dark-text'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      <Settings className="mr-2 h-5 w-5" />
                      Notifications
                    </button>
                  )}
                </HeadlessMenu.Item>
              </div>
              <div className="px-1 py-1">
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-cuet-secondary-700 text-white' : 'text-gray-900 dark:text-dark-text'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Logout
                    </button>
                  )}
                </HeadlessMenu.Item>
              </div>
            </HeadlessMenu.Items>
          </Transition>
        </HeadlessMenu>
      </div>
    </header>
  );
};

export default Navbar;
