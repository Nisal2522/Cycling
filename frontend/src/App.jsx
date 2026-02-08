import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import RideTracking from './pages/RideTracking';
import RouteDetails from './pages/RouteDetails';
import RoutesPage from './pages/Routes';
import Challenges from './pages/Challenges';
import Rewards from './pages/Rewards';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Authenticated Routes wrapped in Layout via PrivateRoute */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/create-route"
              element={
                <PrivateRoute>
                  <AdminPanel />
                </PrivateRoute>
              }
            />
            <Route
              path="/ride"
              element={
                <PrivateRoute>
                  <RideTracking />
                </PrivateRoute>
              }
            />
            <Route
              path="/routes"
              element={
                <PrivateRoute>
                  <RoutesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/routes/:id"
              element={
                <PrivateRoute>
                  <RouteDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/challenges"
              element={
                <PrivateRoute>
                  <Challenges />
                </PrivateRoute>
              }
            />
            <Route
              path="/rewards"
              element={
                <PrivateRoute>
                  <Rewards />
                </PrivateRoute>
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
