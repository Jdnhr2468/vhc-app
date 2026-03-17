import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Typography, Paper, IconButton,
  Avatar, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Chip, Button, Drawer, Divider
} from '@mui/material';
import {
  Heart, Droplets, Wind, Bell,
  LayoutGrid, BarChart3, Settings, LogOut,
  ChevronRight, Smartphone, Flame, Zap, PersonStanding, X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../services/firebase';
import { addAlert, subscribeAlerts, subscribeDevices, markAlertRead, subscribeSettings, saveBiomarkerSnapshot } from '../services/firestoreService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import AIChat from './AIChat';
import BottomNav    from '../components/layout/BottomNav';
import MobileHeader from '../components/layout/MobileHeader';
import { useLanguage } from '../context/LanguageContext';
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
  successBg: '#F0FDF4',
  warning:   '#F59E0B',
  danger:    '#EF4444',
};

const generateHistory = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    steps: Math.floor(Math.random() * 6000) + 4000,
  }));
};

const INSIGHTS = [
  { emoji: '🚶', text: 'Evening walk reduced glucose by 0.8 mmol/L. Keep the 15-min post-dinner walk!' },
  { emoji: '❤️', text: 'Heart rate variability improved by 12% this week — great sign of recovery.' },
  { emoji: '😴', text: 'Sleep efficiency was 94% last night. Your sleep debt is nearly cleared.' },
  { emoji: '🏆', text: "Step goal hit 5 days in a row. Almost at 'Steps Master II' badge!" },
];

const THRESHOLDS = {
  hr: { min: 50, max: 100,  label: 'Heart Rate',   unit: 'bpm'    },
  ox: { min: 95, max: 100,  label: 'Oxygen Level', unit: '%'      },
  gl: { min: 4.0, max: 7.8, label: 'Glucose',      unit: 'mmol/L' },
};

// ✅ НОВЫЙ: виджет погоды
function WeatherWidget({ language }) {
  const [weather, setWeather]   = useState(null);
  const [city,    setCity]      = useState(null);
  const [loading, setLoading]   = useState(true);
  const [denied,  setDenied]    = useState(false);

  const fetchWeather = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      const data = await res.json();
      setWeather(data.current_weather);

      // ✅ ИЗМЕНЕНО: передаём язык в запрос
      const langCode = { english: 'en', russian: 'ru', kazakh: 'kk' }[language] || 'en';
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=${langCode}`
      );
      const geoData = await geoRes.json();
      setCity(
        geoData.address?.city ||
        geoData.address?.town ||
        geoData.address?.village ||
        geoData.address?.county ||
        'Unknown'
      );
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (!navigator.geolocation) { setLoading(false); return; }

    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      ()    => { setDenied(true); setLoading(false); },
      { enableHighAccuracy: false, timeout: 10000 }
    );

    const iv = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => {}
      );
    }, 10 * 60 * 1000);

    return () => clearInterval(iv);
 // eslint-disable-next-line react-hooks/exhaustive-deps
}, [language]); 

  const getWeatherInfo = (code) => {
    if (code === 0) return { icon: '☀️', label: 'Clear',  gradient: 'linear-gradient(135deg, #FEF3C7, #FDE68A)' };
    if (code <= 2)  return { icon: '🌤️', label: 'Partly', gradient: 'linear-gradient(135deg, #DBEAFE, #EFF6FF)' };
    if (code <= 3)  return { icon: '☁️', label: 'Cloudy', gradient: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)' };
    if (code <= 67) return { icon: '🌧️', label: 'Rainy',  gradient: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)' };
    if (code <= 77) return { icon: '❄️', label: 'Snowy',  gradient: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' };
    return                 { icon: '⛈️', label: 'Stormy', gradient: 'linear-gradient(135deg, #E0E7FF, #C7D2FE)' };
  };

  if (loading) return (
    <Paper elevation={0} sx={{
      px: 2, py: 1, borderRadius: '16px',
      border: `1px solid ${theme.border}`,
      bgcolor: theme.bg, display: 'flex', alignItems: 'center',
    }}>
      <Typography sx={{ fontSize: '0.75rem', color: theme.textMuted }}> Loading...</Typography>
    </Paper>
  );

  if (denied) return (
    <Paper elevation={0} onClick={() => window.location.reload()} sx={{
      px: 2, py: 1, borderRadius: '16px',
      border: `1px solid ${theme.border}`,
      bgcolor: theme.bg, display: 'flex', alignItems: 'center',
      cursor: 'pointer',
    }}>
      <Typography sx={{ fontSize: '0.75rem', color: theme.textMuted }}>📍 Allow location</Typography>
    </Paper>
  );

  if (!weather) return null;

  const info = getWeatherInfo(weather.weathercode);

  return (
    <Paper elevation={0} sx={{
      px: 2, py: 1.2, borderRadius: '16px',
      background: info.gradient,
      border: `1px solid rgba(0,0,0,0.06)`,
      display: 'flex', alignItems: 'center', gap: 1.5,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    }}>
      <Typography sx={{ fontSize: '1.4rem', lineHeight: 1 }}>{info.icon}</Typography>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: theme.textMain, lineHeight: 1 }}>
            {Math.round(weather.temperature)}°
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: theme.textSub, fontWeight: 600 }}>C</Typography>
        </Box>
        {city && (
          <Typography sx={{ fontSize: '0.65rem', color: theme.textSub, fontWeight: 600, lineHeight: 1.2 }}>
            📍 {city}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function AlertsModal({ open, onClose, alerts, onMarkRead }) {
  const severityColor = {
    high:   { bg: '#FEF2F2', text: theme.danger,  border: '#FECACA' },
    medium: { bg: '#FFFBEB', text: theme.warning, border: '#FDE68A' },
    low:    { bg: theme.successBg, text: theme.success, border: '#BBF7D0' },
  };

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose}
      PaperProps={{ sx: { borderRadius: '24px 24px 0 0', maxHeight: '80vh', px: 2, pt: 1, pb: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
        <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: theme.border }} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: theme.textMain }}>Health Alerts</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: theme.textSub }}>{alerts.filter(a => !a.read).length} unread</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ bgcolor: theme.bg, borderRadius: '12px' }}>
          <X size={18} color={theme.textSub} />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ overflowY: 'auto' }}>
        {alerts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ fontSize: '2rem', mb: 1 }}>✅</Typography>
            <Typography sx={{ color: theme.textSub, fontWeight: 600 }}>No alerts</Typography>
          </Box>
        ) : (
          alerts.map((alert) => {
            const s = severityColor[alert.severity] || severityColor.low;
            return (
              <Box key={alert.id} sx={{
                p: 2, mb: 1.5, borderRadius: '16px',
                bgcolor: alert.read ? theme.bg : s.bg,
                border: `1px solid ${alert.read ? theme.border : s.border}`,
                opacity: alert.read ? 0.7 : 1,
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Box sx={{ px: 1, py: 0.2, borderRadius: '8px', bgcolor: s.bg, border: `1px solid ${s.border}` }}>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: s.text, textTransform: 'uppercase' }}>
                          {alert.severity}
                        </Typography>
                      </Box>
                      {!alert.read && <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: theme.primary }} />}
                    </Box>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: theme.textMain, mb: 0.3 }}>{alert.type}</Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: theme.textSub, lineHeight: 1.5 }}>{alert.message}</Typography>
                  </Box>
                  {!alert.read && (
                    <Button size="small" onClick={() => onMarkRead(alert.id)} sx={{
                      ml: 1, flexShrink: 0, fontSize: '0.7rem', textTransform: 'none',
                      borderRadius: '10px', color: theme.primary, bgcolor: theme.primaryBg,
                      '&:hover': { bgcolor: '#DBEAFE' }, minWidth: 'auto', px: 1.5,
                    }}>
                      Mark read
                    </Button>
                  )}
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Drawer>
  );
}

function Sidebar({ navigate, location, user, alertCount }) {
  const { t } = useLanguage();
  const menuItems = [
    { label: t.dashboard, icon: <LayoutGrid />, path: '/dashboard' },
    { label: t.devices,   icon: <Smartphone />, path: '/devices'   },
    { label: t.alerts,    icon: <Bell />,        path: '/alerts'    },
    { label: t.reports,   icon: <BarChart3 />,   path: '/reports'   },
    { label: t.settings,  icon: <Settings />,    path: '/settings'  },
  ];

  return (
    <Box sx={{
      width: 250, bgcolor: theme.white,
      display: { xs: 'none', md: 'flex' },
      flexDirection: 'column',
      borderRight: `1px solid ${theme.border}`,
      position: 'fixed', height: '100vh', zIndex: 100,
    }}>
      <Box sx={{ p: 3 }}>
        <BioSenseLogo variant="sidebar" />
      </Box>

      <Box sx={{ px: 3, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: theme.successBg,
          px: 2, py: 0.8, borderRadius: '20px', width: 'fit-content' }}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: theme.success,
            animation: 'pulse 1.5s infinite',
            '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } }
          }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: theme.success }}>
            {t.liveMonitoring}
          </Typography>
        </Box>
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
                {item.label === t.alerts && alertCount > 0 && (
                  <Box sx={{ bgcolor: theme.danger, color: 'white', borderRadius: '10px',
                    px: 1, py: 0.2, fontSize: '0.7rem', fontWeight: 700 }}>
                    {alertCount}
                  </Box>
                )}
                {isActive && item.label !== t.alerts && <ChevronRight size={15} color={theme.primary} />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2.5, borderTop: `1px solid ${theme.border}` }}>
        <Box onClick={() => navigate('/profile')} sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, px: 1,
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
            <Typography sx={{ fontSize: '0.7rem', color: theme.textMuted }}>{t.patient}</Typography>
          </Box>
        </Box>
        <ListItemButton onClick={() => { auth.signOut(); navigate('/login'); }}
          sx={{ borderRadius: '12px', color: theme.textMuted, py: 1,
            '&:hover': { bgcolor: '#FEF2F2', color: theme.danger } }}>
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}><LogOut size={18} /></ListItemIcon>
          <ListItemText primary={t.logout} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
        </ListItemButton>
      </Box>
    </Box>
  );
}

function BiomarkerCard({ title, value, unit, icon, color, status, statusColor }) {
  const statusBg = {
    green:  { bg: theme.successBg, text: theme.success },
    yellow: { bg: '#FFFBEB',       text: theme.warning  },
    red:    { bg: '#FEF2F2',       text: theme.danger   },
  }[statusColor || 'green'];

  return (
    <Paper elevation={0} sx={{
      p: { xs: 1.5, md: 2.5 }, borderRadius: '24px',
      border: `1px solid ${theme.border}`,
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
      position: 'relative', overflow: 'hidden',
      '&::before': {
        content: '""', position: 'absolute', top: 0, left: 0, right: 0,
        height: '3px', bgcolor: color,
      }
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ bgcolor: `${color}18`, p: 1.2, borderRadius: '12px', display: 'flex' }}>
          {React.cloneElement(icon, { size: 22, color })}
        </Box>
        <Chip label={status} size="small" sx={{
          bgcolor: statusBg.bg, color: statusBg.text,
          fontWeight: 700, fontSize: '0.7rem', height: 24,
        }} />
      </Box>
      <Typography sx={{ fontSize: { xs: '0.72rem', md: '0.8rem' }, color: theme.textSub, fontWeight: 600, mb: 0.5 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
        <Typography sx={{ fontSize: { xs: '1.3rem', md: '1.7rem' }, fontWeight: 800, color: theme.textMain, letterSpacing: '-1px' }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: theme.textMuted, fontWeight: 600 }}>{unit}</Typography>
      </Box>
    </Paper>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const user     = auth.currentUser;
  const { t, language } = useLanguage();

  const [vitals, setVitals] = useState({
    hr: 72, bp: '120/80', ox: 98,
    gl: 5.2, steps: 7234, cal: 1840,
  });
  const [history]    = useState(generateHistory);
  const [insight]    = useState(() => INSIGHTS[Math.floor(Math.random() * INSIGHTS.length)]);
  const [alertCount, setAlertCount] = useState(0);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [visibleCards, setVisibleCards] = useState(() => {
  try {
    const cached = localStorage.getItem('visibleCards');
    return cached ? JSON.parse(cached) : {
      heartRate: true, bp: true, oxygen: true,
      glucose: true, steps: true, calories: true,
    };
  } catch {
    return { heartRate: true, bp: true, oxygen: true, glucose: true, steps: true, calories: true };
  }
});

  const lastAlertTime = useRef({});
  const [alerts,     setAlerts]     = useState([]);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const lastSnapshotTime = useRef(0);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeAlerts(user.uid, (alerts) => {
      setAlerts(alerts);
      setAlertCount(alerts.filter(a => !a.read).length);
    });
    return () => unsub && unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeDevices(user.uid, (data) => {
      setConnectedDevices(data.filter(d => d.connected));
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeSettings(user.uid, (data) => {
      if (data?.visibleCards) {
        setVisibleCards(prev => ({ ...prev, ...data.visibleCards }));
        localStorage.setItem('visibleCards', JSON.stringify(data.visibleCards));
      }
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  useEffect(() => {
    if (!user) return;
    const iv = setInterval(async () => {
      setVitals(prev => {
        // Сохраняем snapshot каждые 5 минут
  if (Date.now() - lastSnapshotTime.current > 5 * 60 * 1000) {
    lastSnapshotTime.current = Date.now();
   saveBiomarkerSnapshot(user.uid, next);
  }
        const next = {
          ...prev,
          hr:    Math.max(45, Math.min(115, prev.hr + Math.floor(Math.random() * 8) - 4)),
          ox:    Math.max(92, Math.min(100, prev.ox + Math.floor(Math.random() * 3) - 1)),
          gl:    Math.max(3.5, Math.min(9.0, +(prev.gl + (Math.random() * 0.6 - 0.3)).toFixed(1))),
          steps: prev.steps + Math.floor(Math.random() * 10),
          cal:   prev.cal   + Math.floor(Math.random() * 3),
        };
        const now = Date.now();
        const COOLDOWN = 5 * 60 * 1000;
        if (next.hr > THRESHOLDS.hr.max) {
          if (!lastAlertTime.current.hr_high || now - lastAlertTime.current.hr_high > COOLDOWN) {
            lastAlertTime.current.hr_high = now;
            addAlert(user.uid, { type: 'High Heart Rate Detected', message: `Heart rate reached ${next.hr} bpm.`, severity: next.hr > 110 ? 'high' : 'medium', read: false });
          }
        } else if (next.hr < THRESHOLDS.hr.min) {
          if (!lastAlertTime.current.hr_low || now - lastAlertTime.current.hr_low > COOLDOWN) {
            lastAlertTime.current.hr_low = now;
            addAlert(user.uid, { type: 'Low Heart Rate Detected', message: `Heart rate dropped to ${next.hr} bpm.`, severity: 'high', read: false });
          }
        }
        if (next.ox < THRESHOLDS.ox.min) {
          if (!lastAlertTime.current.ox_low || now - lastAlertTime.current.ox_low > COOLDOWN) {
            lastAlertTime.current.ox_low = now;
            addAlert(user.uid, { type: 'Low Oxygen Level', message: `SpO2 dropped to ${next.ox}%.`, severity: next.ox < 93 ? 'high' : 'medium', read: false });
          }
        }
        if (next.gl > THRESHOLDS.gl.max) {
          if (!lastAlertTime.current.gl_high || now - lastAlertTime.current.gl_high > COOLDOWN) {
            lastAlertTime.current.gl_high = now;
            addAlert(user.uid, { type: 'High Glucose Level', message: `Blood glucose reached ${next.gl} mmol/L.`, severity: next.gl > 8.5 ? 'high' : 'medium', read: false });
          }
        } else if (next.gl < THRESHOLDS.gl.min) {
          if (!lastAlertTime.current.gl_low || now - lastAlertTime.current.gl_low > COOLDOWN) {
            lastAlertTime.current.gl_low = now;
            addAlert(user.uid, { type: 'Low Glucose Level', message: `Blood glucose dropped to ${next.gl} mmol/L.`, severity: 'high', read: false });
          }
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(iv);
  }, [user]);

  const biomarkers = [
    { key: 'heartRate',     title: t.heartRate,      value: vitals.hr,                     unit: 'bpm',      icon: <Heart />,          color: '#EF4444', status: vitals.hr > 100 ? t.high : vitals.hr < 50 ? t.low : t.normal,   statusColor: vitals.hr > 100 || vitals.hr < 50 ? 'red' : 'green' },
    { key: 'bp',            title: t.bloodPressure,  value: vitals.bp,                     unit: 'mmHg',     icon: <Zap />,            color: '#F59E0B', status: t.normal,   statusColor: 'green' },
    { key: 'oxygen',        title: t.oxygenLevel,    value: vitals.ox,                     unit: '%',        icon: <Wind />,           color: '#3B82F6', status: vitals.ox < 95 ? t.low : t.optimal,  statusColor: vitals.ox < 95 ? 'red' : 'green' },
    { key: 'glucose',       title: t.glucose,        value: vitals.gl,                     unit: 'mmol/L',   icon: <Droplets />,       color: '#8B5CF6', status: vitals.gl > 7.8 ? t.high : vitals.gl < 4 ? t.low : t.normal, statusColor: vitals.gl > 7.8 || vitals.gl < 4 ? 'red' : 'green' },
    { key: 'steps',         title: t.stepsToday,     value: vitals.steps.toLocaleString(), unit: '/ 10,000', icon: <PersonStanding />, color: '#10B981', status: t.active,   statusColor: 'green' },
    { key: 'calories',      title: t.caloriesBurned, value: vitals.cal,                    unit: 'kcal',     icon: <Flame />,          color: '#F59E0B', status: t.onTrack,  statusColor: 'green' },
  ].filter(b => visibleCards[b.key] !== false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.bg }}>
      <Sidebar navigate={navigate} location={location} user={user} alertCount={alertCount} />

      <Box sx={{ flexGrow: 1, ml: { md: '250px' }, width: { xs: '100%', md: 'calc(100% - 250px)' }, display: 'flex', flexDirection: 'column' }}>
        <MobileHeader title="Dashboard" alertCount={alertCount} onAlertClick={() => setAlertsOpen(true)} />

        <Box sx={{ p: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 } }}>

          {/* Десктоп топбар */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textMain, letterSpacing: '-0.5px' }}>
                {t.dashboard}
              </Typography>
              <Typography sx={{ color: theme.textSub, mt: 0.3 }}>
                {t.welcomeBack}, {user?.displayName || user?.email?.split('@')[0]}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* ✅ НОВОЕ: погода в топбаре */}
              <WeatherWidget language={language} />

              <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 1.5,
                bgcolor: theme.white, border: `1px solid ${theme.border}`,
                borderRadius: '20px', px: 2, py: 0.8 }}>
                {connectedDevices.length > 0 ? connectedDevices.map(d => (
                  <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: theme.success }} />
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: theme.textSub }}>
                      {d.name}
                    </Typography>
                  </Box>
                )) : (
                  <Typography sx={{ fontSize: '0.72rem', color: theme.textMuted }}>No devices</Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: theme.successBg,
                px: 2, py: 0.8, borderRadius: '20px' }}>
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: theme.success,
                  animation: 'pulse 1.5s infinite',
                  '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } }
                }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: theme.success }}>{t.live}</Typography>
              </Box>

              <IconButton onClick={() => navigate('/alerts')}
                sx={{ bgcolor: theme.white, border: `1px solid ${theme.border}`, p: 1.2, position: 'relative' }}>
                <Bell size={20} color={alertCount > 0 ? theme.danger : theme.textSub} />
                {alertCount > 0 && (
                  <Box sx={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16,
                    borderRadius: '50%', bgcolor: theme.danger,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '0.6rem', color: 'white', fontWeight: 700 }}>
                      {alertCount > 9 ? '9+' : alertCount}
                    </Typography>
                  </Box>
                )}
              </IconButton>
            </Box>
          </Box>

          {/* Мобильное приветствие */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: theme.textMain }}>
                {t.welcomeBack}, {user?.displayName || user?.email?.split('@')[0]} 
              </Typography>
              {/* ✅ НОВОЕ: погода на мобильном */}
              <WeatherWidget language={language} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: theme.success,
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } }
              }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: theme.success }}>{t.liveMonitoring}</Typography>
            </Box>
          </Box>

          {/* ✅ ИЗМЕНЕНО: новая сетка — биомаркеры шире, insight и activity справа */}
          <Grid container spacing={2}>

            {/* Биомаркеры — занимают больше места */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                {biomarkers.map(b => (
                  <Grid item xs={6} sm={4} md={4} key={b.key}>
                    <BiomarkerCard {...b} />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* ✅ НОВОЕ: правая колонка — Insight + Weekly Activity */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>

                {/* Today's Insight — маленькое окошко */}
                <Paper elevation={0} sx={{
                  p: 2, borderRadius: '20px',
                  background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)',
                  border: '1px solid #BFDBFE',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: theme.primary }} />
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: theme.primary,
                      textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {t.todayInsight}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: theme.textMain, lineHeight: 1.6, mb: 1.5 }}>
                    {insight.emoji} {insight.text}
                  </Typography>
                  <Button onClick={() => navigate('/reports')} fullWidth size="small"
                    sx={{
                      borderRadius: '10px', textTransform: 'none',
                      fontWeight: 700, bgcolor: theme.primary, color: 'white',
                      fontSize: '0.78rem',
                      '&:hover': { bgcolor: '#1D4ED8' },
                    }}>
                    {t.viewReports}
                  </Button>
                </Paper>

                {/* Weekly Activity — шире */}
                <Paper elevation={0} sx={{
                  p: 2.5, borderRadius: '20px', flexGrow: 1,
                  border: `1px solid ${theme.border}`,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                }}>
                  <Typography sx={{ fontWeight: 700, color: theme.textMain, mb: 0.5 }}>
                    {t.weeklyActivity}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: theme.textSub, mb: 2 }}>
                    {t.stepsWeek}
                  </Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={history} barSize={14}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: theme.textMuted }}
                        axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: theme.textMuted }}
                        axisLine={false} tickLine={false} width={35} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: `1px solid ${theme.border}`, fontSize: 12 }}
                        formatter={v => [`${v.toLocaleString()} steps`, 'Steps']}
                      />
                      <Bar dataKey="steps" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>

              </Box>
            </Grid>

          </Grid>
        </Box>
      </Box>

      <AlertsModal
        open={alertsOpen}
        onClose={() => setAlertsOpen(false)}
        alerts={alerts}
        onMarkRead={(id) => markAlertRead(user.uid, id)}
      />

      <AIChat vitals={vitals} />
      <BottomNav />
    </Box>
  );
}