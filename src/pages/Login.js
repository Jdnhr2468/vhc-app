import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  Box, Typography, TextField, Button,
  Alert, InputAdornment, IconButton
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Activity, Eye, EyeOff } from 'lucide-react';

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
        bgcolor: theme.primary,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 6,
        background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Декоративные круги */}
        {[
          { size: 300, top: '-80px', left: '-80px', opacity: 0.08 },
          { size: 200, bottom: '60px', right: '-60px', opacity: 0.1 },
          { size: 150, top: '40%', right: '10%', opacity: 0.06 },
        ].map((circle, i) => (
          <Box key={i} sx={{
            position: 'absolute',
            width: circle.size, height: circle.size,
            borderRadius: '50%',
            bgcolor: 'white',
            opacity: circle.opacity,
            top: circle.top, bottom: circle.bottom,
            left: circle.left, right: circle.right,
          }} />
        ))}

        {/* Контент левой панели */}
        <Box sx={{ position: 'relative', textAlign: 'center', maxWidth: 380 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', p: 2.5, borderRadius: '24px',
              backdropFilter: 'blur(10px)' }}>
              <Activity size={48} color="white" />
            </Box>
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
        p: { xs: 3, md: 6 },
        bgcolor: theme.white,
      }}>
        <Box sx={{ width: '100%', maxWidth: 380 }}>

          {/* Лого (только на мобильном) */}
          <Box sx={{ display: { xs: 'flex', md: 'none' },
            alignItems: 'center', gap: 1.5, mb: 4, justifyContent: 'center' }}>
            <Box sx={{ bgcolor: theme.primaryBg, p: 1.2, borderRadius: '14px', display: 'flex' }}>
              <Activity size={28} color={theme.primary} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: theme.textMain }}>
              BioSense
            </Typography>
          </Box>

          {/* Заголовок */}
          <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: theme.textMain,
            letterSpacing: '-0.5px', mb: 0.5 }}>
            Welcome back 👋
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
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: theme.primary,
                textDecoration: 'none', fontWeight: 600 }}>
                Forgot password?
              </Link>
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