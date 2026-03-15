import React, { useMemo, useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Chip, Button,
  IconButton, TextField, InputAdornment,
  Checkbox, FormControlLabel, Stack,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar,
  CircularProgress
} from '@mui/material';
import {
  AlertTriangle, Activity, Wind, Search, X,
  Bell, LayoutGrid, BarChart3, Settings,
  LogOut, ChevronRight, Smartphone
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../services/firebase';
import { subscribeAlerts, markAlertRead, addAlert } from '../services/firestoreService';
import BottomNav    from '../components/layout/BottomNav';
import MobileHeader from '../components/layout/MobileHeader';

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
  warning:   '#F59E0B',
  danger:    '#EF4444',
};

const menuItems = [
  { label: 'Dashboard', icon: <LayoutGrid />, path: '/dashboard' },
  { label: 'Devices',   icon: <Smartphone />, path: '/devices'   },
  { label: 'Alerts',    icon: <Bell />,        path: '/alerts'    },
  { label: 'Reports',   icon: <BarChart3 />,   path: '/reports'   },
  { label: 'Settings',  icon: <Settings />,    path: '/settings'  },
];

const severityConfig = {
  high:   { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA', iconColor: '#DC2626', label: 'High' },
  medium: { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A', iconColor: '#D97706', label: 'Medium' },
  low:    { bg: '#F0FDF4', color: '#065F46', border: '#BBF7D0', iconColor: '#059669', label: 'Low' },
};

const getIcon = (type = '') => {
  const t = type.toLowerCase();
  if (t.includes('oxygen') || t.includes('breath')) return Wind;
  if (t.includes('heart') || t.includes('pulse') || t.includes('glucose') || t.includes('blood')) return Activity;
  return AlertTriangle;
};

const formatDate = (timestamp) => {
  if (!timestamp) return { dateKey: 'unknown', dateLabel: 'Unknown', time: '' };
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now  = new Date();
  const diff = Math.floor((now - date) / 86400000);
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (diff === 0) return { dateKey: 'today',     dateLabel: 'Today',     time };
  if (diff === 1) return { dateKey: 'yesterday', dateLabel: 'Yesterday', time };
  return {
    dateKey:   date.toISOString().split('T')[0],
    dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    time,
  };
};

function Sidebar({ navigate, location, user, unreadCount }) {
  return (
    <Box sx={{
      width: 250, bgcolor: theme.white,
      display: { xs: 'none', md: 'flex' },
      flexDirection: 'column',
      borderRight: `1px solid ${theme.border}`,
      position: 'fixed', height: '100vh', zIndex: 100,
    }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ bgcolor: theme.primary, p: 1, borderRadius: '12px', display: 'flex' }}>
          <Activity color="white" size={22} />
        </Box>
        <Typography sx={{ fontWeight: 800, color: theme.textMain, fontSize: '1.1rem' }}>
          BioSense
        </Typography>
      </Box>

      <List sx={{ px: 2, mt: 1, flexGrow: 1 }}>
        {menuItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton onClick={() => navigate(item.path)} sx={{
                borderRadius: '14px', py: 1.2,
                bgcolor: isActive ? theme.primaryBg : 'transparent',
                color:   isActive ? theme.primary  : theme.textSub,
                '&:hover': { bgcolor: '#F1F5F9' },
              }}>
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? theme.primary : theme.textMuted }}>
                  {React.cloneElement(item.icon, { size: 20 })}
                </ListItemIcon>
                <ListItemText primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive ? 700 : 500 }} />
                {item.label === 'Alerts' && unreadCount > 0 && (
                  <Box sx={{ bgcolor: theme.danger, color: 'white', borderRadius: '10px',
                    px: 0.8, py: 0.1, fontSize: '0.7rem', fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
                    {unreadCount}
                  </Box>
                )}
                {isActive && unreadCount === 0 && <ChevronRight size={15} color={theme.primary} />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2.5, borderTop: `1px solid ${theme.border}` }}>
        <Box onClick={() => navigate('/profile')} sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5,
          cursor: 'pointer', borderRadius: '12px', p: 1,
          '&:hover': { bgcolor: theme.primaryBg }
        }}>
          <Avatar sx={{ bgcolor: '#DBEAFE', color: theme.primary, fontWeight: 700, width: 36, height: 36, fontSize: '0.85rem' }}>
            {(user?.displayName || user?.email)?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: theme.textMain }}>
              {user?.displayName || user?.email?.split('@')[0] || 'User'}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: theme.textMuted }}>Patient</Typography>
          </Box>
        </Box>
        <ListItemButton onClick={() => { auth.signOut(); navigate('/login'); }}
          sx={{ borderRadius: '12px', color: theme.textMuted, py: 1,
            '&:hover': { bgcolor: '#FEF2F2', color: theme.danger } }}>
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}><LogOut size={18} /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
        </ListItemButton>
      </Box>
    </Box>
  );
}

export default function Alerts() {
  const navigate = useNavigate();
  const location = useLocation();
  const user     = auth.currentUser;

  const [alerts,         setAlerts]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [query,          setQuery]          = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [unreadOnly,     setUnreadOnly]     = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeAlerts(user.uid, (data) => {
      setAlerts(data);
      setLoading(false);
    });
    return () => unsub && unsub();
  }, [user]);

  useEffect(() => {
    if (!loading && alerts.length === 0 && user) {
      const demo = [
        { type: 'High Blood Pressure Detected',  message: 'Systolic pressure reached 158 mmHg. Consider resting and monitoring.', severity: 'high',   read: false },
        { type: 'Low Oxygen Level',               message: 'SpO2 dropped to 93%. Try deep breathing exercises.',                   severity: 'high',   read: false },
        { type: 'Glucose Variability Alert',      message: 'Glucose fluctuated ±2.1 mmol/L in the last 3 hours.',                 severity: 'medium', read: false },
        { type: 'Irregular Heart Rate Pattern',   message: 'Heart rate varied between 58–112 bpm. Possible arrhythmia signal.',   severity: 'medium', read: true  },
        { type: 'Daily Step Goal Achieved',       message: 'You walked 10,243 steps today. Great work!',                          severity: 'low',    read: true  },
        { type: 'Hydration Reminder',             message: 'You have not logged water intake in the last 4 hours.',               severity: 'low',    read: true  },
      ];
      demo.forEach(a => addAlert(user.uid, a));
    }
  }, [loading, alerts.length, user]);

  const toggleRead = async (alert) => {
    await markAlertRead(user.uid, alert.id, !alert.read);
  };

  const markAllRead = async () => {
    const unread = alerts.filter(a => !a.read);
    await Promise.all(unread.map(a => markAlertRead(user.uid, a.id, true)));
  };

  const filtered = useMemo(() => alerts.filter(a => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (unreadOnly && a.read) return false;
    if (query && !`${a.type} ${a.message}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  }), [alerts, severityFilter, unreadOnly, query]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach(a => {
      const { dateKey, dateLabel, time } = formatDate(a.timestamp);
      const enriched = { ...a, dateKey, dateLabel, time };
      if (!map.has(dateKey)) map.set(dateKey, { label: dateLabel, items: [] });
      map.get(dateKey).items.push(enriched);
    });
    return Array.from(map.values());
  }, [filtered]);

  const unreadCount = alerts.filter(a => !a.read).length;

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.bg }}>
      <Sidebar navigate={navigate} location={location} user={user} unreadCount={unreadCount} />

      {/* ✅ ДОБАВЛЕНО: мобильный хедер */}
      <MobileHeader title="Alerts" alertCount={unreadCount} />

      {/* ✅ ИЗМЕНЕНО: добавлен pb для мобильной навигации */}
      <Box sx={{ flexGrow: 1, ml: { md: '250px' }, p: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 }, overflowY: 'hidden' }}>

        {/* ✅ ИЗМЕНЕНО: десктопный топбар скрыт на мобильном */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textMain, letterSpacing: '-0.5px' }}>
              Alerts
            </Typography>
            <Typography sx={{ color: theme.textSub, mt: 0.3 }}>
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'All caught up — no unread alerts'}
            </Typography>
          </Box>
          {unreadCount > 0 && (
            <Button variant="outlined" size="small" onClick={markAllRead}
              sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}>
              Mark all as read ({unreadCount})
            </Button>
          )}
        </Box>

        {/* ✅ ДОБАВЛЕНО: мобильный заголовок */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
          <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: theme.textMain }}>
            Alerts
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
            <Typography sx={{ color: theme.textSub, fontSize: '0.85rem' }}>
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'All caught up!'}
            </Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={markAllRead}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600,
                  fontSize: '0.75rem', bgcolor: theme.primary, color: 'white',
                  '&:hover': { bgcolor: '#1D4ED8' } }}>
                Mark all read
              </Button>
            )}
          </Box>
        </Box>

        {/* Фильтры */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '20px', border: `1px solid ${theme.border}` }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField fullWidth size="small" value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search alerts..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search size={16} color={theme.textMuted} /></InputAdornment>,
                  endAdornment: query ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setQuery('')}><X size={14} /></IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Grid>
            <Grid item xs={12} md={7}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                {['all', 'high', 'medium', 'low'].map(s => (
                  <Button key={s} size="small" onClick={() => setSeverityFilter(s)}
                    sx={{
                      borderRadius: '10px', textTransform: 'capitalize', fontWeight: 600,
                      bgcolor: severityFilter === s ? theme.primary : theme.bg,
                      color:   severityFilter === s ? 'white' : theme.textSub,
                      border:  `1px solid ${severityFilter === s ? theme.primary : theme.border}`,
                      '&:hover': { bgcolor: severityFilter === s ? '#1D4ED8' : theme.border },
                    }}>
                    {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
                <FormControlLabel
                  control={<Checkbox checked={unreadOnly} onChange={() => setUnreadOnly(!unreadOnly)} size="small" />}
                  label={<Typography sx={{ fontSize: '0.85rem', color: theme.textSub }}>Unread only</Typography>}
                  sx={{ ml: 1 }}
                />
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Список алертов */}
        {grouped.length === 0 ? (
          <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: '24px',
            border: `1px solid ${theme.border}` }}>
            <Typography sx={{ fontSize: '2rem', mb: 1 }}>✅</Typography>
            <Typography sx={{ fontWeight: 700, color: theme.textMain, mb: 0.5 }}>No alerts found</Typography>
            <Typography sx={{ color: theme.textSub, fontSize: '0.9rem' }}>
              No alerts match your current filters.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {grouped.map(group => (
              <Box key={group.label}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: theme.textMuted,
                  textTransform: 'uppercase', letterSpacing: '1px', mb: 1.5 }}>
                  {group.label}
                </Typography>
                <Stack spacing={1.5}>
                  {group.items.map(alert => {
                    const Icon = getIcon(alert.type);
                    const s    = severityConfig[alert.severity] || severityConfig.low;
                    return (
                      <Paper key={alert.id} elevation={0} sx={{
                        p: { xs: 2, md: 2.5 }, borderRadius: '20px',
                        border: `1px solid ${alert.read ? theme.border : s.border}`,
                        bgcolor: alert.read ? theme.white : s.bg,
                        opacity: alert.read ? 0.75 : 1,
                        transition: 'all 0.2s',
                        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
                      }}>
                        {/* ✅ ИЗМЕНЕНО: на мобильном колонка, на десктопе строка */}
                        <Box sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'flex-start' },
                          gap: 2
                        }}>
                          <Box sx={{ width: 44, height: 44, borderRadius: '14px', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: `${s.iconColor}18` }}>
                            <Icon size={20} color={s.iconColor} />
                          </Box>

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: theme.textMain }}>
                                {alert.type}
                              </Typography>
                              <Chip label={s.label} size="small" sx={{
                                bgcolor: `${s.iconColor}18`, color: s.iconColor,
                                fontWeight: 700, fontSize: '0.7rem', height: 22,
                              }} />
                              {!alert.read && (
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.primary }} />
                              )}
                            </Box>
                            <Typography sx={{ fontSize: '0.85rem', color: theme.textSub, mb: 1 }}>
                              {alert.message}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: theme.textMuted }}>
                              {alert.time} • {alert.dateLabel}
                            </Typography>
                          </Box>

                          {/* ✅ ИЗМЕНЕНО: кнопки на мобильном растянуты */}
                          <Stack direction="row" spacing={1} sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>
                            <Button size="small" onClick={() => toggleRead(alert)}
                              sx={{
                                flex: { xs: 1, sm: 'none' },
                                borderRadius: '10px', textTransform: 'none', fontWeight: 600,
                                fontSize: '0.8rem', border: `1px solid ${theme.border}`,
                                color: theme.textSub, bgcolor: theme.white,
                                '&:hover': { bgcolor: theme.bg }
                              }}>
                              {alert.read ? 'Mark Unread' : 'Mark Read'}
                            </Button>
                            <Button size="small"
                              sx={{
                                flex: { xs: 1, sm: 'none' },
                                borderRadius: '10px', textTransform: 'none', fontWeight: 600,
                                fontSize: '0.8rem', bgcolor: theme.primary, color: 'white',
                                '&:hover': { bgcolor: '#1D4ED8' }
                              }}>
                              View
                            </Button>
                          </Stack>
                        </Box>
                      </Paper>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {/* ✅ ДОБАВЛЕНО: нижняя навигация */}
      <BottomNav />
    </Box>
  );
}