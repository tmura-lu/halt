import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import BottomNav from './components/BottomNav.jsx';
import FeedPage from './pages/FeedPage.jsx';
import WorkoutPage from './pages/WorkoutPage.jsx';
import AlertsPage from './pages/AlertsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import LoginPage from './pages/LoginPage.jsx';

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-base)',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '3px solid rgba(124,58,237,0.15)',
          borderTopColor: '#7C3AED',
          animation: 'spin 0.75s linear infinite',
        }}
      />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { loading, authenticated } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!authenticated) return <Navigate to="/login" replace />;
  return children;
}

function Layout({ children }) {
  return (
    <div className="app-shell">
      <main className="main-content">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout><FeedPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout"
              element={
                <ProtectedRoute>
                  <Layout><WorkoutPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <Layout><AlertsPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout><ProfilePage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
