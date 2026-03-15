import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, Paper, Button, Avatar,
  List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Switch, Slider, CircularProgress
} from '@mui/material';
import {
  Activity, Bell, LayoutGrid, BarChart3, Settings,
  LogOut, ChevronRight, Smartphone, Globe, Ruler,
  Info, Users, Heart, Droplets, Wind, Zap,
  PersonStanding, Flame, Eye
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../services/firebase';
import { getUserSettings, saveUserSettings } from '../services/firestoreService';
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

const dashboardCards = [
  { key: 'heartRate', label: 'Heart Rate',     icon: <Heart size={16} />,          color: '#EF4444' },
  { key: 'bp',        label: 'Blood Pressure', icon: <Zap size={16} />,            color: '#F59E0B' },
  { key: 'oxygen',    label: 'Oxygen Level',   icon: <Wind size={16} />,           color: '#3B82F6' },
  { key: 'glucose',   label: 'Glucose',        icon: <Droplets size={16} />,       color: '#8B5CF6' },
  { key: 'steps',     label: 'Steps Today',    icon: <PersonStanding size={16} />, color: '#10B981' },
  { key: 'calories',  label: 'Calories Burned',icon: <Flame size={16} />,          color: '#F59E0B' },
];

// Дефолтные настройки
const DEFAULT_SETTINGS = {
  language:     'english',
  units:        { glucose: 'mmol', weight: 'kg' },
  fontSize:     2,
  notifTime:    'morning',
  notifTypes:   { critical: true, reminders: true, goals: true, reports: false },
  thresholds: {
    heartRate: { min: 60,  max: 100 },
    glucose:   { min: 4.0, max: 7.8 },
    oxygen:    { min: 95,  max: 100 },
    systolic:  { min: 90,  max: 140 },
  },
  visibleCards: {
    heartRate: true, bp: true, oxygen: true,
    glucose: true, steps: true, calories: true,
  },
};

function Sidebar({ navigate, location, user }) {
  return (
    <Box sx={{
      width: 250, bgcolor: theme.white,
      display: { xs: 'none', md: 'flex' },
      flexDirection: 'column',
      borderRight: `1px solid ${theme.border}`,
      position: 'fixed', height: '100vh', zIndex: 100,
    }}>
      
      
            {/* ✅ ИЗМЕНЕНО: pb для мобильной навигации */}
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
                {isActive && <ChevronRight size={15} color={theme.primary} />}
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

export default function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user     = auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  // ── Все настройки в одном объекте ──
  const [language,     setLanguage]     = useState(DEFAULT_SETTINGS.language);
  const [units,        setUnits]        = useState(DEFAULT_SETTINGS.units);
  const [fontSize,     setFontSize]     = useState(DEFAULT_SETTINGS.fontSize);
  const [notifTime,    setNotifTime]    = useState(DEFAULT_SETTINGS.notifTime);
  const [notifTypes,   setNotifTypes]   = useState(DEFAULT_SETTINGS.notifTypes);
  const [thresholds,   setThresholds]   = useState(DEFAULT_SETTINGS.thresholds);
  const [visibleCards, setVisibleCards] = useState(DEFAULT_SETTINGS.visibleCards);

  // ── Загрузка настроек из Firestore ──
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const data = await getUserSettings(user.uid);
      if (data) {
        setLanguage(    data.language     || DEFAULT_SETTINGS.language);
        setUnits(       data.units        || DEFAULT_SETTINGS.units);
        setFontSize(    data.fontSize     || DEFAULT_SETTINGS.fontSize);
        setNotifTime(   data.notifTime    || DEFAULT_SETTINGS.notifTime);
        setNotifTypes(  data.notifTypes   || DEFAULT_SETTINGS.notifTypes);
        setThresholds(  data.thresholds   || DEFAULT_SETTINGS.thresholds);
        setVisibleCards(data.visibleCards || DEFAULT_SETTINGS.visibleCards);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  // ── Сохранение в Firestore ──
  const handleSave = async () => {
    setSaving(true);
    const ok = await saveUserSettings(user.uid, {
      language, units, fontSize,
      notifTime, notifTypes,
      thresholds, visibleCards,
    });
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const toggleCard = (key) => {
    const active = Object.values(visibleCards).filter(Boolean).length;
    if (visibleCards[key] && active <= 2) return;
    setVisibleCards(p => ({ ...p, [key]: !p[key] }));
  };

  const fontSizeLabels = ['Small', 'Medium', 'Large', 'X-Large'];

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.bg }}>
      <Sidebar navigate={navigate} location={location} user={user} />
      <Box sx={{
                flexGrow: 1,
                ml: { md: '250px' },
                width: { xs: '100%', md: 'calc(100% - 250px)' },
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
              }}>
      {/* ✅ MobileHeader здесь */}
        <MobileHeader title="Settings" />

      <Box sx={{ p: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 }, width: '100%' }}>

        {/* Топбар */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textMain, letterSpacing: '-0.5px' }}>
              Settings
            </Typography>
            <Typography sx={{ color: theme.textSub, mt: 0.3 }}>
              Manage your app preferences
            </Typography>
          </Box>
          <Button onClick={handleSave} disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              bgcolor: saved ? theme.success : theme.primary, color: 'white',
              borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3,
              '&:hover': { bgcolor: saved ? '#059669' : '#1D4ED8' },
              transition: 'background 0.3s',
            }}>
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
          </Button>
        </Box>

        <Grid container spacing={3}>

          {/* ══ КОЛОНКА 1 ══ */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Language */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                <Typography sx={{ fontWeight: 700, color: theme.textMain, mb: 2,
                  display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Globe size={16} color={theme.primary} /> Language
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {[
                    { key: 'english', label: '🇬🇧 English' },
                    { key: 'russian', label: '🇷🇺 Russian' },
                    { key: 'kazakh',  label: '🇰🇿 Kazakh'  },
                  ].map(lang => (
                    <Button key={lang.key} onClick={() => setLanguage(lang.key)} sx={{
                      borderRadius: '12px', textTransform: 'none', fontWeight: 600, px: 2.5, py: 1,
                      bgcolor: language === lang.key ? theme.primary : theme.bg,
                      color:   language === lang.key ? 'white' : theme.textSub,
                      border:  `1px solid ${language === lang.key ? theme.primary : theme.border}`,
                      '&:hover': { bgcolor: language === lang.key ? '#1D4ED8' : theme.border },
                    }}>
                      {lang.label}
                    </Button>
                  ))}
                </Box>
                <Typography sx={{ fontSize: '0.75rem', color: theme.textMuted, mt: 1.5 }}>
                  * Full translation coming in Stage 2
                </Typography>
              </Paper>

              {/* Units */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                <Typography sx={{ fontWeight: 700, color: theme.textMain, mb: 2,
                  display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Ruler size={16} color={theme.primary} /> Units of Measurement
                </Typography>
                {[
                  { key: 'glucose', label: 'Blood Glucose',
                    options: [{ key: 'mmol', label: 'mmol/L', desc: 'International' }, { key: 'mgdl', label: 'mg/dL', desc: 'USA standard' }] },
                  { key: 'weight',  label: 'Weight & Height',
                    options: [{ key: 'kg',  label: 'kg / cm',  desc: 'Metric'   }, { key: 'lbs', label: 'lbs / ft', desc: 'Imperial' }] },
                ].map(row => (
                  <Box key={row.key} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: theme.textSub, mb: 1 }}>
                      {row.label}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {row.options.map(u => (
                        <Box key={u.key} onClick={() => setUnits(p => ({ ...p, [row.key]: u.key }))} sx={{
                          flex: 1, p: 1.5, borderRadius: '14px', cursor: 'pointer',
                          border: `2px solid ${units[row.key] === u.key ? theme.primary : theme.border}`,
                          bgcolor: units[row.key] === u.key ? theme.primaryBg : theme.white,
                          transition: 'all 0.2s',
                        }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.88rem',
                            color: units[row.key] === u.key ? theme.primary : theme.textMain }}>
                            {u.label}
                          </Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: theme.textMuted }}>{u.desc}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Paper>

              {/* Accessibility */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                <Typography sx={{ fontWeight: 700, color: theme.textMain, mb: 2,
                  display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Eye size={16} color={theme.primary} /> Accessibility
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: theme.textSub, mb: 2 }}>
                  Text Size
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  {fontSizeLabels.map((label, i) => (
                    <Box key={i} onClick={() => setFontSize(i + 1)} sx={{
                      flex: 1, py: 1.5, borderRadius: '12px', textAlign: 'center',
                      cursor: 'pointer', transition: 'all 0.2s',
                      border: `2px solid ${fontSize === i + 1 ? theme.primary : theme.border}`,
                      bgcolor: fontSize === i + 1 ? theme.primaryBg : theme.white,
                    }}>
                      <Typography sx={{
                        fontWeight: 700, fontSize: `${0.65 + i * 0.1}rem`,
                        color: fontSize === i + 1 ? theme.primary : theme.textSub,
                      }}>A</Typography>
                      <Typography sx={{ fontSize: '0.62rem', color: theme.textMuted, mt: 0.3 }}>
                        {label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ p: 2, bgcolor: theme.bg, borderRadius: '12px', border: `1px solid ${theme.border}` }}>
                  <Typography sx={{ fontSize: '0.72rem', color: theme.textMuted, mb: 0.5 }}>Preview:</Typography>
                  <Typography sx={{ fontWeight: 600, color: theme.textMain,
                    fontSize: `${0.75 + (fontSize - 1) * 0.1}rem` }}>
                    Heart Rate: 72 bpm — Normal
                  </Typography>
                  <Typography sx={{ color: theme.textSub, fontSize: `${0.65 + (fontSize - 1) * 0.1}rem` }}>
                    Last updated 3 seconds ago
                  </Typography>
                </Box>
              </Paper>

              {/* About */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                <Typography sx={{ fontWeight: 700, color: theme.textMain, mb: 2,
                  display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Info size={16} color={theme.primary} /> About BioSense
                </Typography>
                {[
                  { label: 'Version',  value: '1.0.0 (Stage 1)' },
                  { label: 'Build',    value: 'March 2026'       },
                  { label: 'Platform', value: 'React Web App'    },
                ].map(item => (
                  <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between',
                    py: 1.2, borderBottom: `1px solid ${theme.border}`,
                    '&:last-child': { borderBottom: 0 } }}>
                    <Typography sx={{ fontSize: '0.85rem', color: theme.textSub }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: theme.textMain }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
                <Box sx={{ mt: 2, p: 2, bgcolor: theme.primaryBg, borderRadius: '14px' }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: theme.primary, mb: 1,
                    display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Users size={14} /> Aktobe Group 5 — BioSense
                  </Typography>
                  {[
                    'Alisher Zhalmukhambetov — PM',
                    'Moldir Aitmagambetova — UI/UX',
                    'Miras Kuramysov — Backend',
                    'Aman Alzhaparov — QA',
                    'Aliya Khamzina — Database',
                    'Miras Ersaiynov — Tester',
                  ].map(m => (
                    <Typography key={m} sx={{ fontSize: '0.75rem', color: theme.textSub, lineHeight: 1.8 }}>
                      {m}
                    </Typography>
                  ))}
                  <Typography sx={{ fontSize: '0.72rem', color: theme.textMuted, mt: 1 }}>
                    Heriot-Watt University · Software Engineering CW2
                  </Typography>
                </Box>
              </Paper>

            </Box>
          </Grid>

          {/* ══ КОЛОНКА 2 ══ */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Notification Preferences */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                <Typography sx={{ fontWeight: 700, color: theme.textMain, mb: 2,
                  display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Bell size={16} color={theme.primary} /> Notification Settings
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: theme.textSub, mb: 1 }}>
                  Notification Time
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
                  {[
                    { key: 'morning',   label: '🌅 Morning',   desc: '8:00 AM' },
                    { key: 'afternoon', label: '☀️ Afternoon', desc: '2:00 PM' },
                    { key: 'evening',   label: '🌙 Evening',   desc: '8:00 PM' },
                    { key: 'realtime',  label: '⚡ Real-time', desc: 'Instant' },
                  ].map(t => (
                    <Box key={t.key} onClick={() => setNotifTime(t.key)} sx={{
                      flex: '1 1 calc(50% - 4px)', p: 1.5, borderRadius: '12px',
                      cursor: 'pointer', transition: 'all 0.2s',
                      border: `2px solid ${notifTime === t.key ? theme.primary : theme.border}`,
                      bgcolor: notifTime === t.key ? theme.primaryBg : theme.white,
                    }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700,
                        color: notifTime === t.key ? theme.primary : theme.textMain }}>
                        {t.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: theme.textMuted }}>{t.desc}</Typography>
                    </Box>
                  ))}
                </Box>

                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: theme.textSub, mb: 1 }}>
                  Notification Types
                </Typography>
                {[
                  { key: 'critical',  label: 'Critical Alerts',  desc: 'Abnormal biomarker values',  color: theme.danger  },
                  { key: 'reminders', label: 'Daily Reminders',   desc: 'Medication & activity',      color: theme.warning },
                  { key: 'goals',     label: 'Goal Achievements', desc: 'When you hit your targets',  color: theme.success },
                  { key: 'reports',   label: 'Weekly Reports',    desc: 'Summary every Monday',       color: '#8B5CF6'     },
                ].map(n => (
                  <Box key={n.key} sx={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', py: 1.2, borderBottom: `1px solid ${theme.border}`,
                    '&:last-child': { borderBottom: 0 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: n.color, flexShrink: 0 }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: theme.textMain }}>
                          {n.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.73rem', color: theme.textSub }}>{n.desc}</Typography>
                      </Box>
                    </Box>
                    <Switch checked={notifTypes[n.key]} size="small"
                      onChange={() => setNotifTypes(p => ({ ...p, [n.key]: !p[n.key] }))} />
                  </Box>
                ))}
              </Paper>

              {/* Alert Thresholds */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                <Typography sx={{ fontWeight: 700, color: theme.textMain, mb: 0.5,
                  display: 'flex', alignItems: 'center', gap: 1 }}>
                  🎯 Alert Thresholds
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: theme.textSub, mb: 2 }}>
                  You will receive an alert when values go outside these ranges
                </Typography>
                {[
                  { key: 'heartRate', label: 'Heart Rate',  unit: 'bpm',    color: '#EF4444', min: 40, max: 180 },
                  { key: 'glucose',   label: 'Glucose',     unit: 'mmol/L', color: '#8B5CF6', min: 2,  max: 15  },
                  { key: 'oxygen',    label: 'Oxygen',      unit: '%',      color: '#3B82F6', min: 85, max: 100 },
                  { key: 'systolic',  label: 'Systolic BP', unit: 'mmHg',   color: '#F59E0B', min: 70, max: 200 },
                ].map(metric => (
                  <Box key={metric.key} sx={{ mb: 2.5, '&:last-child': { mb: 0 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: theme.textMain }}>
                        {metric.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: metric.color }}>
                        {thresholds[metric.key].min} – {thresholds[metric.key].max} {metric.unit}
                      </Typography>
                    </Box>
                    <Slider
                      value={[thresholds[metric.key].min, thresholds[metric.key].max]}
                      onChange={(_, val) => setThresholds(p => ({
                        ...p, [metric.key]: { min: val[0], max: val[1] }
                      }))}
                      min={metric.min} max={metric.max}
                      step={metric.key === 'glucose' ? 0.1 : 1}
                      sx={{ color: metric.color, height: 4,
                        '& .MuiSlider-thumb': { width: 14, height: 14 } }}
                    />
                  </Box>
                ))}
              </Paper>

              {/* Dashboard Layout */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                <Typography sx={{ fontWeight: 700, color: theme.textMain, mb: 0.5,
                  display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LayoutGrid size={16} color={theme.primary} /> Dashboard Layout
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: theme.textSub, mb: 2 }}>
                  Choose which cards to show on your dashboard (min. 2)
                </Typography>
                <Grid container spacing={1}>
                  {dashboardCards.map(card => {
                    const active = visibleCards[card.key];
                    return (
                      <Grid item xs={6} key={card.key}>
                        <Box onClick={() => toggleCard(card.key)} sx={{
                          p: 1.5, borderRadius: '14px', cursor: 'pointer',
                          border: `2px solid ${active ? card.color + '60' : theme.border}`,
                          bgcolor: active ? `${card.color}08` : theme.white,
                          display: 'flex', alignItems: 'center', gap: 1.5,
                          transition: 'all 0.2s', opacity: active ? 1 : 0.5,
                        }}>
                          <Box sx={{ color: active ? card.color : theme.textMuted }}>{card.icon}</Box>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600,
                            color: active ? theme.textMain : theme.textMuted }}>
                            {card.label}
                          </Typography>
                          {active && (
                            <Box sx={{ ml: 'auto', width: 8, height: 8,
                              borderRadius: '50%', bgcolor: card.color }} />
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
                <Typography sx={{ fontSize: '0.72rem', color: theme.textMuted, mt: 1.5 }}>
                  {Object.values(visibleCards).filter(Boolean).length} of {dashboardCards.length} cards visible
                </Typography>
              </Paper>

            </Box>
          </Grid>

        </Grid>
      </Box>
      </Box>
      {/* ✅ ДОБАВЛЕНО: нижняя навигация — видна только на телефоне */}
            <BottomNav />
    </Box>
  );
}