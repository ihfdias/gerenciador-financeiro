import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import { AuthProvider } from './context/AuthContext';
import Spinner from './components/Spinner';
import { useAuth } from './hooks/useAuth';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AnalyticsDashboardPage = lazy(() => import('./pages/AnalyticsDashboardPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

function FullPageSpinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Spinner />
    </div>
  );
}

const PrivateWrapper = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageSpinner />;
  }

  return isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<FullPageSpinner />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:id/:token" element={<ResetPasswordPage />} />
            <Route element={<PrivateWrapper />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/analytics" element={<AnalyticsDashboardPage />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
