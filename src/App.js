import React, { useEffect, useState, useCallback, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from './services/firebase';
import { Box, CircularProgress, Snackbar, Alert, Button } from '@mui/material';

import Login       from "./pages/Login";
import Register    from "./pages/Register";
import Dashboard   from "./pages/Dashboard";
import Profile     from "./pages/Profile";
import Alerts      from "./pages/Alerts";
import Reports     from "./pages/Reports";
import Devices     from "./pages/Devices";
import Settings    from "./pages/Settings";
import Onboarding  from './pages/Onboarding';
import VerifyEmail from './pages/VerifyEmail';

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 минут
const WARNING_TIME =  1 * 60 * 1000; // предупреждение за 1 минуту

function ProtectedRoute({ user, loading, children }) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
        <CircularProgress />
      </Box>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

function IdleHandler({ user }) {
  const navigate        = useNavigate();
  const [warning, setWarning] = useState(false);
  const timer           = useRef(null);
  const warningTimer    = useRef(null);

  const resetTimer = useCallback(() => {
    clearTimeout(timer.current);
    clearTimeout(warningTimer.current);

    warningTimer.current = setTimeout(() => {
      setWarning(true);
    }, IDLE_TIMEOUT - WARNING_TIME);

    timer.current = setTimeout(async () => {
      setWarning(false);
      await signOut(auth);
      navigate('/login');
    }, IDLE_TIMEOUT);
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearTimeout(timer.current);
      clearTimeout(warningTimer.current);
    };
  }, [user, resetTimer]);

  if (!user) return null;

  return (
    <Snackbar open={warning} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert
        severity="warning"
        sx={{ fontWeight: 600, alignItems: 'center' }}
        action={
          <Button
            color="inherit"
            size="small"
            sx={{ fontWeight: 700 }}
            onClick={() => { setWarning(false); resetTimer(); }}>
            Stay Logged In
          </Button>
        }>
        ⚠️ You will be logged out in 1 minute due to inactivity!
      </Alert>
    </Snackbar>
  );
}

export default function App() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <IdleHandler user={user} />
      <Routes>
        {/* Публичные */}
        <Route path="/login"    element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={<Register />} />

        {/* Защищённые */}
        <Route path="/onboarding"   element={<ProtectedRoute user={user} loading={loading}><Onboarding /></ProtectedRoute>} />
        <Route path="/dashboard"    element={<ProtectedRoute user={user} loading={loading}><Dashboard /></ProtectedRoute>} />
        <Route path="/devices"      element={<ProtectedRoute user={user} loading={loading}><Devices /></ProtectedRoute>} />
        <Route path="/alerts"       element={<ProtectedRoute user={user} loading={loading}><Alerts /></ProtectedRoute>} />
        <Route path="/reports"      element={<ProtectedRoute user={user} loading={loading}><Reports /></ProtectedRoute>} />
        <Route path="/profile"      element={<ProtectedRoute user={user} loading={loading}><Profile /></ProtectedRoute>} />
        <Route path="/settings"     element={<ProtectedRoute user={user} loading={loading}><Settings /></ProtectedRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}