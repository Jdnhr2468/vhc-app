import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup,sendPasswordResetEmail  } from 'firebase/auth';
import { auth, googleProvider, facebookProvider, appleProvider  } from '../services/firebase';
import {
  Box, Typography, TextField, Button,
  Alert, InputAdornment, IconButton
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Activity, Eye, EyeOff } from 'lucide-react';
import BioSenseLogo from '../components/BioSenseLogo';


const theme = {
  bg:        '#F8FAFC',
  white:     '#FFFFFF',
  primary:   '#2563EB',
  primaryBg: '#EFF6FF',
  border:    '#E2E8F0',
  textMain:  '#1E293B',
  textSub:   '#64748B',
  textMuted: '#94A3B8',
  danger:    '#EF4444',
};

export default function Login() {
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const navigate = useNavigate();
  const [resetSent, setResetSent] = useState(false);

const handleForgotPassword = async () => {
  if (!email) {
    setError('Please enter your email address first.');
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    setResetSent(true);
    setError('');
  } catch (err) {
    setError('Failed to send reset email. Check your email address.');
  }
};

  const handleGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Создаём профиль если новый пользователь
    navigate('/dashboard');
  } catch (err) {
    setError('Google sign in failed. Please try again.');
  }
};

const handleFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    navigate('/dashboard');
  } catch (err) {
    setError('Facebook sign in failed. Please try again.');
  }
};

const handleApple = async () => {
  try {
    await signInWithPopup(auth, appleProvider);
    navigate('/dashboard');
  } catch (err) {
    setError('Apple sign in failed. Please try again.');
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Проверяем верифицирован ли email
      if (!user.emailVerified) {
        await auth.signOut();
        setError('Please verify your email before logging in. Check your inbox.');
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      bgcolor: theme.bg,
    }}>

      {/* ── ЛЕВАЯ ПАНЕЛЬ (декоративная) ── */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 6,
        background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {[
          { size: 300, top: '-80px',   left: '-80px',  opacity: 0.08 },
          { size: 200, bottom: '60px', right: '-60px', opacity: 0.10 },
          { size: 150, top: '40%',     right: '10%',   opacity: 0.06 },
        ].map((c, i) => (
          <Box key={i} sx={{
            position: 'absolute',
            width: c.size, height: c.size,
            borderRadius: '50%', bgcolor: 'white', opacity: c.opacity,
            top: c.top, bottom: c.bottom, left: c.left, right: c.right,
          }} />
        ))}


        {/* Контент левой панели */}
        <Box sx={{ position: 'relative', textAlign: 'center', maxWidth: 380 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
  <BioSenseLogo variant="icon" />
</Box>
          <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: 'white',
            letterSpacing: '-0.5px', mb: 2, lineHeight: 1.2 }}>
            Monitor your health in real time
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
            Track your vitals, connect devices, and get personalised health insights — all in one place.
          </Typography>

          {/* Статистика */}
          <Box sx={{ display: 'flex', gap: 2, mt: 5, justifyContent: 'center' }}>
            {[
              { value: '6+', label: 'Biomarkers' },
              { value: '24/7', label: 'Monitoring' },
              { value: '100%', label: 'Secure' },
            ].map(stat => (
              <Box key={stat.label} sx={{ bgcolor: 'rgba(255,255,255,0.12)',
                borderRadius: '16px', px: 2.5, py: 1.5, backdropFilter: 'blur(8px)' }}>
                <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: 'white' }}>
                  {stat.value}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── ПРАВАЯ ПАНЕЛЬ (форма) ── */}
      <Box sx={{
        flex: { xs: 1, md: '0 0 480px' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 3, md: 3 },
        bgcolor: theme.white,
      }}>
        <Box sx={{ width: '100%', maxWidth: 380 }}>

          {/* Лого (только на мобильном) */}
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
  <BioSenseLogo variant="splash" iconSize={80} fontSize={30} />
</Box>

          {/* Заголовок */}
          <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: theme.textMain,
            letterSpacing: '-0.5px', mb: 0.5 }}>
            Welcome back 
          </Typography>
          <Typography sx={{ color: theme.textSub, mb: 3.5, fontSize: '0.95rem' }}>
            Sign in to your BioSense account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '14px',
              fontSize: '0.85rem' }}>
              {error}
            </Alert>
          )}

          {resetSent && (
  <Alert severity="success" sx={{ mb: 2.5, borderRadius: '14px', fontSize: '0.85rem' }}>
     Password reset email sent! Check your inbox.
  </Alert>
)}
        
          {/* Форма */}
          <Box component="form" onSubmit={handleSubmit}>

            {/* Email */}
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: theme.textMain, mb: 0.8 }}>
              Email Address
            </Typography>
            <TextField
              fullWidth required
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              sx={{ mb: 2.5, '& .MuiOutlinedInput-root': {
                borderRadius: '14px', bgcolor: theme.bg,
                '& fieldset': { borderColor: theme.border },
                '&:hover fieldset': { borderColor: theme.primary },
                '&.Mui-focused fieldset': { borderColor: theme.primary },
              }}}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={18} color={theme.textMuted} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Password */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: theme.textMain }}>
                Password
              </Typography>
              <Typography onClick={handleForgotPassword} sx={{
  fontSize: '0.8rem', color: theme.primary,
  fontWeight: 600, cursor: 'pointer',
  '&:hover': { textDecoration: 'underline' }
}}>
  Forgot password?
</Typography>

            </Box>
            <TextField
              fullWidth required
              placeholder="Enter your password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': {
                borderRadius: '14px', bgcolor: theme.bg,
                '& fieldset': { borderColor: theme.border },
                '&:hover fieldset': { borderColor: theme.primary },
                '&.Mui-focused fieldset': { borderColor: theme.primary },
              }}}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={18} color={theme.textMuted} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} color={theme.textMuted} /> : <Eye size={18} color={theme.textMuted} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />


            {/* Кнопка */}
            <Button type="submit" fullWidth disabled={loading}
              endIcon={<LogIn size={18} />}
              sx={{
                py: 1.6, borderRadius: '14px', textTransform: 'none',
                fontWeight: 700, fontSize: '1rem',
                bgcolor: theme.primary, color: 'white',
                boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
                '&:hover': { bgcolor: '#1D4ED8', boxShadow: '0 6px 24px rgba(37,99,235,0.4)' },
                '&:disabled': { bgcolor: theme.textMuted, boxShadow: 'none' },
              }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

          </Box>

                     {/* Разделитель */}
<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5, mt: 2.5 }}>
  <Box sx={{ flex: 1, height: '1px', bgcolor: theme.border }} />
  <Typography sx={{ fontSize: '0.8rem', color: theme.textMuted, fontWeight: 600 }}>or</Typography>
  <Box sx={{ flex: 1, height: '1px', bgcolor: theme.border }} />
</Box>

            {/* Социальные кнопки */}
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
  
  {/* Google */}
  <Button fullWidth onClick={handleGoogle}
    sx={{
      py: 1.4, borderRadius: '14px', textTransform: 'none',
      fontWeight: 600, fontSize: '0.95rem',
      bgcolor: theme.white, color: theme.textMain,
      border: `1px solid ${theme.border}`,
      '&:hover': { bgcolor: theme.bg },
      display: 'flex', gap: 1.5,
    }}>
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
    Continue with Google
  </Button>

  {/* Facebook */}
  <Button fullWidth onClick={handleFacebook}
    sx={{
      py: 1.4, borderRadius: '14px', textTransform: 'none',
      fontWeight: 600, fontSize: '0.95rem',
      bgcolor: '#1877F2', color: 'white',
      '&:hover': { bgcolor: '#166FE5' },
      display: 'flex', gap: 1.5,
    }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
    Continue with Facebook
  </Button>

    {/* Apple */}
<Button fullWidth onClick={handleApple}
  sx={{
    py: 1.4, borderRadius: '14px', textTransform: 'none',
    fontWeight: 600, fontSize: '0.95rem',
    bgcolor: '#000000', color: 'white',
    '&:hover': { bgcolor: '#1a1a1a' },
    display: 'flex', gap: 1.5,
  }}>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
  Continue with Apple
</Button>

</Box>


          {/* Регистрация */}
          <Typography sx={{ textAlign: 'center', mt: 3, fontSize: '0.88rem', color: theme.textSub }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: theme.primary, fontWeight: 700, textDecoration: 'none' }}>
              Create account
            </Link>
          </Typography>

          {/* Heriot-Watt badge */}
          <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${theme.border}`, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.72rem', color: theme.textMuted }}>
              Heriot-Watt University · Aktobe Group 5 · BioSense
            </Typography>
          </Box>

        </Box>
      </Box>

    </Box>
  );
}