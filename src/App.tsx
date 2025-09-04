import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';

import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import CRVerificationPage from './pages/auth/CRVerificationPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import NoticesPage from './pages/NoticesPage';
import NoticePage from './pages/NoticePage';
import FilesPage from './pages/FilesPage';
import QAPage from './pages/QAPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import AdminPanelPage from './pages/AdminPanelPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import CGPACalculatorPage from './pages/CGPACalculatorPage'; // Import the new page
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <NotificationProvider>
              <Router>
            <Routes>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/signup/cr-verification" element={<CRVerificationPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
              </Route>
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="notices" element={<NoticesPage />} />
                <Route path="notices/:noticeId" element={<NoticePage />} />
                <Route path="files" element={<FilesPage />} />
                <Route path="q-a" element={<QAPage />} />
                <Route path="q-a/:questionId" element={<QuestionDetailPage />} />
                <Route path="cgpa-calculator" element={<CGPACalculatorPage />} /> {/* Add the new route */}
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="profile/notifications" element={<NotificationSettingsPage />} />
                <Route 
                  path="admin" 
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminPanelPage />
                    </ProtectedRoute>
                  } 
                />
              </Route>
            </Routes>
              </Router>
            </NotificationProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
