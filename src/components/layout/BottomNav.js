import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { LayoutGrid, Smartphone, BarChart3, Settings, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../services/firebase';
import { subscribeAlerts } from '../../services/firestoreService';

const theme = {
  white:     '#FFFFFF',
  primary:   '#2563EB',
  primaryBg: '#EFF6FF',
  border:    '#E2E8F0',
  textSub:   '#64748B',
  textMuted: '#94A3B8',
  danger:    '#EF4444',
};

const menuItems = [
  { label: 'Dashboard', icon: <LayoutGrid size={22} />, path: '/dashboard' },
  { label: 'Devices',   icon: <Smartphone size={22} />, path: '/devices'   },
  { label: 'Profile',    icon: <User size={24} />,        path: '/profile'    },
  { label: 'Reports',   icon: <BarChart3 size={22} />,   path: '/reports'   },
  { label: 'Settings',  icon: <Settings size={22} />,    path: '/settings'  },
];

export default function BottomNav() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = auth.currentUser;
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeAlerts(user.uid, (alerts) => {
      setAlertCount(alerts.filter(a => !a.read).length);
    });
    return () => unsub();
  }, [user]);

  return (
    <Box sx={{
      display:  { xs: 'flex', md: 'none' },
      position: 'fixed', bottom: 0, left: 0, right: 0,
      bgcolor:  theme.white,
      borderTop: `1px solid ${theme.border}`,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      zIndex: 1000,
      pb: 'env(safe-area-inset-bottom)',
    }}>
      {menuItems.map(item => {
        const isActive = location.pathname === item.path;
        return (
          <Box key={item.label} onClick={() => navigate(item.path)} sx={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            py: 1.2, cursor: 'pointer', position: 'relative',
            color: isActive ? theme.primary : theme.textMuted,
            transition: 'all 0.2s',
            '&:active': { transform: 'scale(0.92)' },
          }}>
            {/* Активный индикатор */}
            {isActive && (
              <Box sx={{
                position: 'absolute', top: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: 32, height: 3, borderRadius: '0 0 4px 4px',
                bgcolor: theme.primary,
              }} />
            )}

            {/* Иконка с бейджем для Alerts */}
            <Box sx={{ position: 'relative' }}>
              {React.cloneElement(item.icon, {
                color: isActive ? theme.primary : theme.textMuted,
              })}
              {item.label === 'Alerts' && alertCount > 0 && (
                <Box sx={{
                  position: 'absolute', top: -4, right: -6,
                  width: 16, height: 16, borderRadius: '50%',
                  bgcolor: theme.danger,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Typography sx={{ fontSize: '0.55rem', color: 'white', fontWeight: 700 }}>
                    {alertCount > 9 ? '9+' : alertCount}
                  </Typography>
                </Box>
              )}
            </Box>

            <Typography sx={{
              fontSize: '0.65rem', fontWeight: isActive ? 700 : 500,
              mt: 0.4, color: isActive ? theme.primary : theme.textMuted,
            }}>
              {item.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}