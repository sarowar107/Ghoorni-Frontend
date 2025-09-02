import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import Navbar from '../components/navigation/Navbar';
import EmailVerificationPopup from '../components/EmailVerificationPopup';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showVerificationPopup, setShowVerificationPopup] = useState(true);

  return (
    <div className="relative flex h-screen bg-gray-50 dark:bg-dark-bg overflow-hidden">
      {/* Background Image & Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed opacity-10" 
        style={{ backgroundImage: "url('https://itbi-cuet.com/wp-content/uploads/2024/01/download-2.jpg')" }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-black/30 dark:to-transparent"></div>

      {/* Email Verification Popup */}
      {showVerificationPopup && (
        <EmailVerificationPopup onClose={() => setShowVerificationPopup(false)} />
      )}

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="relative flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
