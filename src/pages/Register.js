import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, getRedirectResult } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, facebookProvider, appleProvider } from '../services/firebase';
import {
  Box, Typography, TextField, Button,
  Alert, InputAdornment, IconButton
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus, Eye, EyeOff } from 'lucide-react';
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

    useEffect(() => {
  const handleRedirect = async () => {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        const user = result.user;
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid, email: user.email,
          displayName: user.displayName,
          createdAt: new Date(), role: 'patient',
        }, { merge: true });
        const isNewUser = result._tokenResponse?.isNewUser;
        if (isNewUser) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError('Sign in failed. Please try again.');
    }
  };
  handleRedirect();
}, [navigate]);

  
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

  const handleSocialLogin = async (provider) => {
  setError('');
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid, email: user.email,
      displayName: user.displayName,
      createdAt: new Date(), role: 'patient',
    }, { merge: true });
    const isNewUser = result._tokenResponse?.isNewUser;
    if (isNewUser) {
      navigate('/onboarding');
    } else {
      navigate('/dashboard');
    }
  } catch (err) {
    setError('Sign in failed. Please try again.');
  }
};
  
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: theme.bg }}>

      {/* Левая панель */}
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
            <BioSenseLogo variant="icon" />
          </Box>
          <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: 'white',
            letterSpacing: '-0.5px', mb: 2, lineHeight: 1.2 }}>
            Your health journey starts here
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
            Join BioSense and take control of your health with real-time monitoring.
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
        p: { xs: 3, md: 3 }, bgcolor: theme.white, overflowY: 'auto',
      }}>
        <Box sx={{ width: '100%', maxWidth: 380 }}>

          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
            <BioSenseLogo variant="splash" iconSize={80} fontSize={30} />
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

            {/* Разделитель */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5, mt: 2.5 }}>
            <Box sx={{ flex: 1, height: '1px', bgcolor: theme.border }} />
            <Typography sx={{ fontSize: '0.78rem', color: theme.textMuted, fontWeight: 600 }}>or</Typography>
            <Box sx={{ flex: 1, height: '1px', bgcolor: theme.border }} />
          </Box>

            {/* Социальные кнопки */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 2 }}>
            <Button fullWidth onClick={() => handleSocialLogin(googleProvider)}
              sx={{
                py: 1.3, borderRadius: '14px', textTransform: 'none',
                fontWeight: 600, fontSize: '0.9rem',
                bgcolor: theme.white, color: theme.textMain,
                border: `1px solid ${theme.border}`,
                '&:hover': { bgcolor: theme.bg },
                display: 'flex', gap: 1.5,
              }}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </Button>

            <Button fullWidth onClick={() => handleSocialLogin(facebookProvider)}
              sx={{
                py: 1.3, borderRadius: '14px', textTransform: 'none',
                fontWeight: 600, fontSize: '0.9rem',
                bgcolor: '#1877F2', color: 'white',
                '&:hover': { bgcolor: '#166FE5' },
                display: 'flex', gap: 1.5,
              }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </Button>

            <Button fullWidth onClick={() => handleSocialLogin(appleProvider)}
              sx={{
                py: 1.3, borderRadius: '14px', textTransform: 'none',
                fontWeight: 600, fontSize: '0.9rem',
                bgcolor: '#000000', color: 'white',
                '&:hover': { bgcolor: '#1a1a1a' },
                display: 'flex', gap: 1.5,
              }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Continue with Apple
            </Button>
          </Box>

          

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