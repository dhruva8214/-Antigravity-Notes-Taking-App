import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import CanvasApp from './pages/CanvasApp';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import CodeToDiagramPage from './pages/CodeToDiagramPage';
import StudyPlannerPage from './pages/StudyPlannerPage';
import DownloadPage from './pages/DownloadPage';

import { useThemeStore } from './store/themeStore';

const App: React.FC = () => {
  const { theme } = useThemeStore();

  React.useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  }, [theme]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/download" element={<DownloadPage />} />

      <Route path="/canvas" element={
        <ProtectedRoute>
          <CanvasApp />
        </ProtectedRoute>
      } />
      <Route path="/code-to-diagram" element={
        <ProtectedRoute>
          <CodeToDiagramPage />
        </ProtectedRoute>
      } />
      <Route path="/study-planner" element={
        <ProtectedRoute>
          <StudyPlannerPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
