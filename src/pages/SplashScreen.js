import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import BioSenseLogo from '../components/BioSenseLogo';

export default function SplashScreen() {
  const navigate  = useNavigate();
  const [opacity, setOpacity] = useState(0);
  const [scale,   setScale]   = useState(0.8);

  useEffect(() => {
    // Появление
    setTimeout(() => {
      setOpacity(1);
      setScale(1);
    }, 100);

    // Исчезновение и переход
    setTimeout(() => {
      setOpacity(0);
      setScale(1.1);
    }, 2200);

    // Переход на нужную страницу
    setTimeout(() => {
      onAuthStateChanged(auth, (user) => {
        if (user && user.emailVerified) {
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      });
    }, 2800);
  }, [navigate]);

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Декоративные круги на фоне */}
      <Box sx={{
        position: 'absolute', width: 500, height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        animation: 'pulse 2s ease-in-out infinite',
        '@keyframes pulse': {
          '0%,100%': { transform: 'translate(-50%, -50%) scale(1)' },
          '50%':     { transform: 'translate(-50%, -50%) scale(1.1)' },
        }
      }} />

      <Box sx={{
        position: 'absolute', width: 300, height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
        top: '30%', left: '60%',
      }} />

      {/* Основной контент */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        opacity,
        transform: `scale(${scale})`,
        transition: 'opacity 0.8s ease, transform 0.8s ease',
        position: 'relative', zIndex: 1,
      }}>
        <BioSenseLogo variant="splash" iconSize={100} fontSize={40} />

        {/* Анимированная точка загрузки */}
        <Box sx={{ display: 'flex', gap: 0.8, mt: 3 }}>
          {[0, 1, 2].map(i => (
            <Box key={i} sx={{
              width: 6, height: 6, borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.4)',
              animation: 'dot 1.2s infinite',
              animationDelay: `${i * 0.2}s`,
              '@keyframes dot': {
                '0%,80%,100%': { opacity: 0.3, transform: 'scale(0.8)' },
                '40%':         { opacity: 1,   transform: 'scale(1.2)' },
              },
            }} />
          ))}
        </Box>
      </Box>

      {/* Копирайт внизу */}
      <Box sx={{
        position: 'absolute', bottom: 32,
        opacity,
        transition: 'opacity 0.8s ease',
      }}>
        <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
          Heriot-Watt University · Aktobe Group 5
        </Typography>
      </Box>

    </Box>
  );
}