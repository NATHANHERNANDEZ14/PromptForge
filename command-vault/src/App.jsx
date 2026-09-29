import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './components/Login';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import FolderView from './components/FolderView';
import CommandsList from './components/CommandsList';
import Administration from './components/Administration';
import DeviceVault from './components/DeviceVault';

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  return (
    <>
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </>
  );
}

function AppContent() {
  const { currentUser } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/folder/:id" element={<ProtectedRoute><FolderView /></ProtectedRoute>} />
      <Route path="/commands" element={<ProtectedRoute><CommandsList /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><Administration /></ProtectedRoute>} />
      <Route path="/devices" element={<ProtectedRoute><DeviceVault /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <AuthProvider>
          <div className="app-container">
            <AppContent />
          </div>
        </AuthProvider>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
