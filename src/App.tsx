import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import CRVerificationPage from './pages/auth/CRVerificationPage';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import NoticesPage from './pages/NoticesPage';
import NoticePage from './pages/NoticePage'; // Import the notice detail page
import FilesPage from './pages/FilesPage';
import QAPage from './pages/QAPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import AdminPanelPage from './pages/AdminPanelPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/signup/cr-verification" element={<CRVerificationPage />} />
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
                <Route path="notices/:noticeId" element={<NoticePage />} /> {/* Add route for single notice */}
                <Route path="files" element={<FilesPage />} />
                <Route path="q-a" element={<QAPage />} />
                <Route path="q-a/:questionId" element={<QuestionDetailPage />} />
                <Route path="profile" element={<ProfilePage />} />
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
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
