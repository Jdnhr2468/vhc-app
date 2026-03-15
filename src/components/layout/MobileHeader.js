import React from 'react';
import { Box, Typography, IconButton, Avatar } from '@mui/material';
import { Bell, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../services/firebase';

const theme = {
  white:    '#FFFFFF',
  primary:  '#2563EB',
  border:   '#E2E8F0',
  textMain: '#1E293B',
  textMuted:'#94A3B8',
  danger:   '#EF4444',
  textSub:  '#64748B',
};

export default function MobileHeader({ title, alertCount = 0, onAlertClick }) {
  const navigate = useNavigate();
  const user     = auth.currentUser;

  return (
    <Box sx={{
      display:  { xs: 'flex', md: 'none' },
      alignItems: 'center', justifyContent: 'space-between',
      px: 2, py: 1.5,
      bgcolor: theme.white,
      borderBottom: `1px solid ${theme.border}`,
      position: 'sticky', top: 0, zIndex: 99,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      {/* Лого */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ bgcolor: theme.primary, p: 0.8, borderRadius: '10px', display: 'flex' }}>
          <Activity color="white" size={18} />
        </Box>
        <Typography sx={{ fontWeight: 800, color: theme.textMain, fontSize: '1rem' }}>
          BioSense
        </Typography>
      </Box>

      {/* Заголовок страницы */}
      <Typography sx={{ fontWeight: 700, color: theme.textMain, fontSize: '0.95rem' }}>
        {title}
      </Typography>

      {/* Правая часть */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={() => onAlertClick ? onAlertClick() : navigate('/alerts')}
          sx={{ p: 1, position: 'relative' }}>
          <Bell size={20} color={alertCount > 0 ? theme.danger : theme.textMuted} />
          {alertCount > 0 && (
            <Box sx={{
              position: 'absolute', top: 4, right: 4,
              width: 14, height: 14, borderRadius: '50%',
              bgcolor: theme.danger,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Typography sx={{ fontSize: '0.55rem', color: 'white', fontWeight: 700 }}>
                {alertCount > 9 ? '9+' : alertCount}
              </Typography>
            </Box>
          )}
        </IconButton>

        <Avatar
          onClick={() => navigate('/profile')}
          sx={{
            width: 32, height: 32, bgcolor: '#DBEAFE',
            color: theme.primary, fontWeight: 700,
            fontSize: '0.8rem', cursor: 'pointer',
          }}>
          {(user?.displayName || user?.email)?.[0]?.toUpperCase() || 'U'}
        </Avatar>
      </Box>
    </Box>
  );
}