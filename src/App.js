import { useEffect, useState, useCallback, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from './services/firebase';
import { Box, CircularProgress, Snackbar, Alert, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useLanguage, LanguageProvider } from './context/LanguageContext';
import { doc, getDoc } from 'firebase/firestore';

import Login        from "./pages/Login";
import Register     from "./pages/Register";
import Dashboard    from "./pages/Dashboard";
import Profile      from "./pages/Profile";
import Alerts       from "./pages/Alerts";
import Reports      from "./pages/Reports";
import Devices      from "./pages/Devices";
import Settings     from "./pages/Settings";
import Onboarding   from './pages/Onboarding';
import VerifyEmail  from './pages/VerifyEmail';
import SplashScreen from './pages/SplashScreen';
import Admin        from './pages/Admin';

const IDLE_TIMEOUT = 15 * 60 * 1000;
const WARNING_TIME =  1 * 60 * 1000;

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

function AdminRoute({ user, userRole, loading, children }) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (userRole !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function IdleHandler({ user }) {
  const navigate     = useNavigate();
  const [warning, setWarning] = useState(false);
  const timer        = useRef(null);
  const warningTimer = useRef(null);

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
      <Alert severity="warning" sx={{ fontWeight: 600, alignItems: 'center' }}
        action={
          <Button color="inherit" size="small" sx={{ fontWeight: 700 }}
            onClick={() => { setWarning(false); resetTimer(); }}>
            Stay Logged In
          </Button>
        }>
        ⚠️ You will be logged out in 1 minute due to inactivity!
      </Alert>
    </Snackbar>
  );
}

function ThemedApp({ children }) {
  const { fontScale } = useLanguage();
  const theme = createTheme({
    typography: { fontSize: 14 * fontScale },
  });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

export default function App() {
  const [user,     setUser]     = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'patient');
          }
        } catch {
          setUserRole('patient');
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <LanguageProvider>
        <ThemedApp>
          <IdleHandler user={user} />
          <Routes>
            {/* Публичные */}
            // ✅ СТАЛО:
<Route path="/login" element={
  !user ? <Login /> :
  userRole === null ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  ) :
  <Navigate to={userRole === 'admin' ? '/admin' : '/dashboard'} />
} />
            <Route path="/register"    element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Admin */}
            <Route path="/admin" element={
              <AdminRoute user={user} userRole={userRole} loading={loading}>
                <Admin />
              </AdminRoute>
            } />

            {/* Защищённые */}
            <Route path="/onboarding" element={<ProtectedRoute user={user} loading={loading}><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard"  element={<ProtectedRoute user={user} loading={loading}><Dashboard /></ProtectedRoute>} />
            <Route path="/devices"    element={<ProtectedRoute user={user} loading={loading}><Devices /></ProtectedRoute>} />
            <Route path="/alerts"     element={<ProtectedRoute user={user} loading={loading}><Alerts /></ProtectedRoute>} />
            <Route path="/reports"    element={<ProtectedRoute user={user} loading={loading}><Reports /></ProtectedRoute>} />
            <Route path="/profile"    element={<ProtectedRoute user={user} loading={loading}><Profile /></ProtectedRoute>} />
            <Route path="/settings"   element={<ProtectedRoute user={user} loading={loading}><Settings /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ThemedApp>
      </LanguageProvider>
    </Router>
  );
}