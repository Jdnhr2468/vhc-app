import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import {
  Box, Typography, TextField, Button,
  Alert, InputAdornment, IconButton
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus, Activity, Eye, EyeOff } from 'lucide-react';

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
  danger:    '#EF4444',
};

export default function Register() {
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [error,           setError]           = useState('');
  const [loading,         setLoading]         = useState(false);
  const navigate = useNavigate();

  const pwStrength = password.length > 10 ? 'Strong'
    : password.length > 6 ? 'Medium'
    : password.length > 0 ? 'Weak' : '';
  const pwStrengthColor = pwStrength === 'Strong' ? theme.success
    : pwStrength === 'Medium' ? '#F59E0B' : theme.danger;
  const pwStrengthWidth = pwStrength === 'Strong' ? '100%'
    : pwStrength === 'Medium' ? '60%'
    : pwStrength === 'Weak'   ? '25%' : '0%';

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid:       user.uid,
        email:     email,
        createdAt: new Date(),
        role:      'patient',
      });

      await sendEmailVerification(user);
      navigate('/verify-email');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try logging in.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError('Registration error: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: theme.bg }}>

      {/* ── ЛЕВАЯ ПАНЕЛЬ ── */}
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

        <Box sx={{ position: 'relative', textAlign: 'center', maxWidth: 380 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', p: 2.5,
              borderRadius: '24px', backdropFilter: 'blur(10px)' }}>
              <Activity size={48} color="white" />
            </Box>
          </Box>
          <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: 'white',
            letterSpacing: '-0.5px', mb: 2, lineHeight: 1.2 }}>
            Your health journey starts here
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
            Join BioSense and take control of your health with real-time monitoring and personalised insights.
          </Typography>
          <Box sx={{ mt: 5, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { emoji: '💓', text: 'Real-time biomarker tracking'      },
              { emoji: '📊', text: 'Weekly health reports & analytics' },
              { emoji: '🔔', text: 'Smart alerts for abnormal values'  },
              { emoji: '🔒', text: 'GDPR-compliant & fully secure'     },
            ].map(f => (
              <Box key={f.text} sx={{ display: 'flex', alignItems: 'center', gap: 1.5,
                bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '14px', px: 2, py: 1.2,
                backdropFilter: 'blur(8px)' }}>
                <Typography sx={{ fontSize: '1.2rem' }}>{f.emoji}</Typography>
                <Typography sx={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                  {f.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── ПРАВАЯ ПАНЕЛЬ ── */}
      <Box sx={{
        flex: { xs: 1, md: '0 0 480px' },
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        p: { xs: 3, md: 6 }, bgcolor: theme.white, overflowY: 'auto',
      }}>
        <Box sx={{ width: '100%', maxWidth: 380 }}>

          <Box sx={{ display: { xs: 'flex', md: 'none' },
            alignItems: 'center', gap: 1.5, mb: 4, justifyContent: 'center' }}>
            <Box sx={{ bgcolor: theme.primaryBg, p: 1.2, borderRadius: '14px', display: 'flex' }}>
              <Activity size={28} color={theme.primary} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: theme.textMain }}>
              BioSense
            </Typography>
          </Box>

          <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: theme.textMain,
            letterSpacing: '-0.5px', mb: 0.5 }}>
            Create account 
          </Typography>
          <Typography sx={{ color: theme.textSub, mb: 3, fontSize: '0.95rem' }}>
            Join BioSense — it's free and takes 30 seconds
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '14px', fontSize: '0.85rem' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleRegister}>

            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: theme.textMain, mb: 0.8 }}>
              Email Address
            </Typography>
            <TextField fullWidth required
              placeholder="you@example.com" type="email"
              value={email} onChange={e => setEmail(e.target.value)}
              sx={{ mb: 2.5, '& .MuiOutlinedInput-root': {
                borderRadius: '14px', bgcolor: theme.bg,
                '& fieldset': { borderColor: theme.border },
                '&:hover fieldset': { borderColor: theme.primary },
                '&.Mui-focused fieldset': { borderColor: theme.primary },
              }}}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Mail size={18} color={theme.textMuted} /></InputAdornment>,
              }}
            />

            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: theme.textMain, mb: 0.8 }}>
              Password
            </Typography>
            <TextField fullWidth required
              placeholder="Min. 6 characters"
              type={showPassword ? 'text' : 'password'}
              value={password} onChange={e => setPassword(e.target.value)}
              sx={{ mb: 1, '& .MuiOutlinedInput-root': {
                borderRadius: '14px', bgcolor: theme.bg,
                '& fieldset': { borderColor: theme.border },
                '&:hover fieldset': { borderColor: theme.primary },
                '&.Mui-focused fieldset': { borderColor: theme.primary },
              }}}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock size={18} color={theme.textMuted} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} color={theme.textMuted} /> : <Eye size={18} color={theme.textMuted} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {password && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontSize: '0.72rem', color: theme.textSub }}>Password strength</Typography>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: pwStrengthColor }}>{pwStrength}</Typography>
                </Box>
                <Box sx={{ height: 3, bgcolor: theme.bg, borderRadius: 2, border: `1px solid ${theme.border}` }}>
                  <Box sx={{ height: '100%', borderRadius: 2, transition: 'width 0.3s',
                    width: pwStrengthWidth, bgcolor: pwStrengthColor }} />
                </Box>
              </Box>
            )}

            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: theme.textMain, mb: 0.8 }}>
              Confirm Password
            </Typography>
            <TextField fullWidth required
              placeholder="Repeat your password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              sx={{ mb: 0.8, '& .MuiOutlinedInput-root': {
                borderRadius: '14px', bgcolor: theme.bg,
                '& fieldset': {
                  borderColor: confirmPassword && confirmPassword !== password ? theme.danger : theme.border,
                },
                '&:hover fieldset': { borderColor: theme.primary },
                '&.Mui-focused fieldset': { borderColor: theme.primary },
              }}}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock size={18} color={theme.textMuted} /></InputAdornment>,
              }}
            />

            {confirmPassword && confirmPassword !== password && (
              <Typography sx={{ fontSize: '0.75rem', color: theme.danger, mb: 1.5, ml: 0.5 }}>
                Passwords do not match
              </Typography>
            )}
            {confirmPassword && confirmPassword === password && (
              <Typography sx={{ fontSize: '0.75rem', color: theme.success, mb: 1.5, ml: 0.5 }}>
                ✓ Passwords match
              </Typography>
            )}

            <Button type="submit" fullWidth disabled={loading}
              endIcon={<UserPlus size={18} />}
              sx={{
                mt: 1.5, py: 1.6, borderRadius: '14px', textTransform: 'none',
                fontWeight: 700, fontSize: '1rem',
                bgcolor: theme.primary, color: 'white',
                boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
                '&:hover': { bgcolor: '#1D4ED8', boxShadow: '0 6px 24px rgba(37,99,235,0.4)' },
                '&:disabled': { bgcolor: theme.textMuted, boxShadow: 'none' },
              }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

          </Box>

          <Typography sx={{ textAlign: 'center', mt: 3, fontSize: '0.88rem', color: theme.textSub }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: theme.primary, fontWeight: 700, textDecoration: 'none' }}>
              Sign in
            </Link>
          </Typography>

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