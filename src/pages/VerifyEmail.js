import { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Mail, RefreshCw, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { sendEmailVerification } from 'firebase/auth';


const theme = {
  bg:        '#F8FAFC',
  white:     '#FFFFFF',
  primary:   '#2563EB',
  primaryBg: '#EFF6FF',
  border:    '#E2E8F0',
  textMain:  '#1E293B',
  textSub:   '#64748B',
  textMuted: '#94A3B8',
  success:   '#10B981',
  successBg: '#F0FDF4',
  danger:    '#EF4444',
};

export default function VerifyEmail() {
  const navigate  = useNavigate();
  const user      = auth.currentUser;
  const [resent,   setResent]   = useState(false);
  const [checking, setChecking] = useState(false);
  const [error,    setError]    = useState('');

  // Каждые 3 секунды проверяем верифицирован ли email
  useEffect(() => {
    const interval = setInterval(async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          clearInterval(interval);
          navigate('/onboarding');
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleResend = async () => {
    try {
      await sendEmailVerification(auth.currentUser);
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err) {
      setError('Too many attempts. Please wait a few minutes.');
    }
  };

  const handleCheckNow = async () => {
    setChecking(true);
    await auth.currentUser.reload();
    if (auth.currentUser.emailVerified) {
      navigate('/onboarding');
    } else {
      setError('Email not verified yet. Please check your inbox.');
    }
    setChecking(false);
  };

  return (
    <Box sx={{
      minHeight: '100vh', bgcolor: theme.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2,
    }}>
      <Box sx={{
        bgcolor: theme.white, borderRadius: '28px',
        border: `1px solid ${theme.border}`,
        boxShadow: '0 4px 32px rgba(0,0,0,0.06)',
        p: { xs: 3, sm: 5 }, maxWidth: 460, width: '100%',
        textAlign: 'center',
      }}>

        {/* Иконка */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box sx={{ bgcolor: theme.primaryBg, p: 3, borderRadius: '50%', display: 'flex' }}>
            <Mail size={40} color={theme.primary} />
          </Box>
        </Box>



        <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: theme.textMain, mb: 1 }}>
          Verify your email 📬
        </Typography>
        <Typography sx={{ color: theme.textSub, fontSize: '0.92rem', mb: 1, lineHeight: 1.7 }}>
          We sent a verification link to
        </Typography>
        <Typography sx={{ fontWeight: 700, color: theme.primary, fontSize: '0.95rem', mb: 2 }}>
          {user?.email}
        </Typography>
        <Typography sx={{ color: theme.textSub, fontSize: '0.85rem', mb: 3, lineHeight: 1.7 }}>
          Click the link in the email to activate your account. This page will redirect automatically.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px', textAlign: 'left' }}>
            {error}
          </Alert>
        )}
        {resent && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: '12px', textAlign: 'left' }}>
            ✓ Verification email resent!
          </Alert>
        )}

        {/* Кнопки */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button fullWidth onClick={handleCheckNow} disabled={checking}
            sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 700,
              bgcolor: theme.primary, color: 'white', py: 1.5, fontSize: '0.95rem',
              '&:hover': { bgcolor: '#1D4ED8' } }}>
            {checking ? 'Checking...' : "I've verified my email ✓"}
          </Button>

          <Button fullWidth onClick={handleResend}
            startIcon={<RefreshCw size={16} />}
            sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 600,
              color: theme.textSub, border: `1px solid ${theme.border}`,
              bgcolor: theme.white, py: 1.2,
              '&:hover': { bgcolor: theme.bg } }}>
            Resend email
          </Button>

          <Button fullWidth onClick={() => { auth.signOut(); navigate('/login'); }}
            startIcon={<LogOut size={16} />}
            sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 600,
              color: theme.textMuted, py: 1,
              '&:hover': { color: theme.danger } }}>
            Use different account
          </Button>
        </Box>

        <Typography sx={{ fontSize: '0.75rem', color: theme.textMuted, mt: 3 }}>
          Didn't receive it? Check spam folder or resend above.
        </Typography>
      </Box>
    </Box>
  );
}