import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MainLayout from './components/MainLayout'; 
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';

const PrivateWrapper = () => {
  const token = localStorage.getItem('token');
  return token ? <MainLayout /> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {}
        <Route element={<PrivateWrapper />}>
          <Route path="/" element={<DashboardPage />} />
           <Route path="/analytics" element={<AnalyticsDashboardPage />} />
          {}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;