import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Rankings from './pages/Rankings.jsx';
import Tournaments from './pages/Tournaments.jsx';
import Gallery from './pages/Gallery.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import BatarangEffect from './components/BatarangEffect.jsx';
import EntryGate from './components/EntryGate.jsx';
import { Analytics } from '@vercel/analytics/react';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Admin routes bypass the EntryGate so they are always accessible */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        {/* All other routes go through the EntryGate splash screen */}
        <Route
          path="*"
          element={
            isAuthorized ? (
              <BatarangEffect>
                <div className="app-container bg-[#050505] min-h-screen selection:bg-primary selection:text-white">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/rankings" element={<Rankings />} />
                    <Route path="/tournaments" element={<Tournaments />} />
                    <Route path="/gallery" element={<Gallery />} />
                  </Routes>
                </div>
              </BatarangEffect>
            ) : (
              <EntryGate onEnter={() => setIsAuthorized(true)} />
            )
          }
        />
      </Routes>
      <Analytics />
    </Router>
  );
}

export default App;
