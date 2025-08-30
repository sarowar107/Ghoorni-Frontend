import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, FileText, FolderKanban, MessageSquare, Shield, User, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Notices', path: '/notices', icon: FileText },
  { name: 'Files', path: '/files', icon: FolderKanban },
  { name: 'Q & A', path: '/q-a', icon: MessageSquare },
];

const adminNav = { name: 'Admin Panel', path: '/admin', icon: Shield };
const profileNav = { name: 'Manage Profile', path: '/profile', icon: User };

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center gap-3">
          <img src="/ghoorni-logo.svg" alt="ghoorni Logo" className="h-10 w-10" />
          <span className="text-xl font-bold font-serif text-cuet-primary-900 dark:text-white">ghoorni</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
          <X size={24} />
        </button>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavItem key={item.name} item={item} currentPath={location.pathname} />
        ))}
        {user?.role === 'admin' && <NavItem item={adminNav} currentPath={location.pathname} />}
      </nav>
      <div className="px-4 py-6 border-t border-gray-200 dark:border-dark-border">
        <NavItem item={profileNav} currentPath={location.pathname} />
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-72 bg-white dark:bg-dark-surface z-40 flex flex-col"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 border-r border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface">
        {sidebarContent}
      </div>
    </>
  );
};

const NavItem = ({ item, currentPath }: { item: { name: string; path: string; icon: React.ElementType }, currentPath: string }) => {
  const isActive = currentPath === item.path;
  return (
    <NavLink
      to={item.path}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-cuet-primary-900 text-white shadow-lg'
          : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-border'
      }`}
    >
      <item.icon className="w-5 h-5 mr-3" />
      <span>{item.name}</span>
    </NavLink>
  );
};

export default Sidebar;
