import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Button,
  List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Avatar, Stack, Drawer, Divider, IconButton
} from '@mui/material';
import {
  Bell, LayoutGrid, BarChart3, Settings,
  LogOut, ChevronRight, Smartphone, Download,
  Share2, TrendingUp, Heart, Droplets, Wind, X
} from 'lucide-react';
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../services/firebase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import BottomNav    from '../components/layout/BottomNav';
import MobileHeader from '../components/layout/MobileHeader';
import { useLanguage } from '../context/LanguageContext';
import BioSenseLogo from '../components/BioSenseLogo';
import { subscribeAlerts, markAlertRead, markAllAlertsRead } from '../services/firestoreService';

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



function AlertsModal({ open, onClose, alerts, onMarkRead, onMarkAllRead }) {
  const severityColor = {
    high:   { bg: '#FEF2F2', text: theme.danger,  border: '#FECACA' },
    medium: { bg: '#FFFBEB', text: theme.warning, border: '#FDE68A' },
    low:    { bg: theme.successBg, text: theme.success, border: '#BBF7D0' },
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60)   return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose}
      PaperProps={{ sx: { borderRadius: '24px 24px 0 0', maxHeight: '80vh', px: 2, pt: 1, pb: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
        <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: theme.border }} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: theme.textMain }}>Health Alerts</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: theme.textSub }}>{unreadCount} unread</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* ✅ Кнопка Mark All Read */}
          {unreadCount > 0 && (
            <Button size="small" onClick={onMarkAllRead}
              sx={{
                fontSize: '0.72rem', textTransform: 'none', fontWeight: 600,
                borderRadius: '10px', color: theme.primary, bgcolor: theme.primaryBg,
                '&:hover': { bgcolor: '#DBEAFE' },
              }}>
              Mark all read
            </Button>
          )}
          <IconButton onClick={onClose} sx={{ bgcolor: theme.bg, borderRadius: '12px' }}>
            <X size={18} color={theme.textSub} />
          </IconButton>
        </Box>
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
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: theme.textMain, mb: 0.3 }}>
                      {alert.type}
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: theme.textSub, lineHeight: 1.5 }}>
                      {alert.message}
                    </Typography>
                    {/* ✅ Время появления */}
                    <Typography sx={{ fontSize: '0.68rem', color: theme.textMuted, mt: 0.5 }}>
                      🕐 {formatTime(alert.createdAt || alert.timestamp)}
                    </Typography>
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

function Sidebar({ navigate, location, user }) {
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

const reportData = {
  glucose: {
    label: 'Glucose', unit: 'mmol/L', color: '#8B5CF6',
    normal: { min: 4.0, max: 7.8 },
    current: 5.2, prev: 5.6, change: -7.1,
    daily: [
      { time: '6AM',  value: 4.8, prev: 5.1 },
      { time: '9AM',  value: 5.4, prev: 5.8 },
      { time: '12PM', value: 6.1, prev: 6.4 },
      { time: '3PM',  value: 5.7, prev: 5.9 },
      { time: '6PM',  value: 5.2, prev: 5.5 },
      { time: '9PM',  value: 4.9, prev: 5.2 },
    ],
    weekly: [
      { day: 'Mon', value: 5.4, prev: 5.8 },
      { day: 'Tue', value: 4.9, prev: 6.1 },
      { day: 'Wed', value: 5.7, prev: 5.5 },
      { day: 'Thu', value: 6.1, prev: 5.9 },
      { day: 'Fri', value: 5.2, prev: 5.4 },
      { day: 'Sat', value: 4.8, prev: 5.7 },
      { day: 'Sun', value: 5.1, prev: 5.6 },
    ],
    monthly: [
      { day: 'Week 1', value: 5.3, prev: 5.6 },
      { day: 'Week 2', value: 5.1, prev: 5.8 },
      { day: 'Week 3', value: 5.4, prev: 5.5 },
      { day: 'Week 4', value: 5.2, prev: 5.7 },
    ],
    insight: 'Your glucose levels improved this week. Post-meal spikes reduced by 18%.',
  },
  heartRate: {
    label: 'Heart Rate', unit: 'bpm', color: '#EF4444',
    normal: { min: 60, max: 100 },
    current: 72, prev: 75, change: -4.0,
    daily: [
      { time: '6AM',  value: 68, prev: 70 },
      { time: '9AM',  value: 75, prev: 78 },
      { time: '12PM', value: 80, prev: 82 },
      { time: '3PM',  value: 76, prev: 79 },
      { time: '6PM',  value: 72, prev: 74 },
      { time: '9PM',  value: 65, prev: 67 },
    ],
    weekly: [
      { day: 'Mon', value: 72, prev: 75 },
      { day: 'Tue', value: 75, prev: 78 },
      { day: 'Wed', value: 73, prev: 74 },
      { day: 'Thu', value: 78, prev: 80 },
      { day: 'Fri', value: 76, prev: 73 },
      { day: 'Sat', value: 74, prev: 76 },
      { day: 'Sun', value: 71, prev: 75 },
    ],
    monthly: [
      { day: 'Week 1', value: 74, prev: 76 },
      { day: 'Week 2', value: 73, prev: 75 },
      { day: 'Week 3', value: 72, prev: 74 },
      { day: 'Week 4', value: 71, prev: 75 },
    ],
    insight: 'Resting heart rate decreased by 4% — a sign of improving cardiovascular fitness.',
  },
  bloodPressure: {
    label: 'Blood Pressure', unit: 'mmHg', color: '#F59E0B',
    normal: { min: 90, max: 140 },
    current: 120, prev: 125, change: -4.0,
    daily: [
      { time: '6AM',  value: 118, prev: 122 },
      { time: '9AM',  value: 122, prev: 126 },
      { time: '12PM', value: 125, prev: 130 },
      { time: '3PM',  value: 121, prev: 125 },
      { time: '6PM',  value: 119, prev: 123 },
      { time: '9PM',  value: 116, prev: 120 },
    ],
    weekly: [
      { day: 'Mon', value: 120, prev: 125 },
      { day: 'Tue', value: 122, prev: 128 },
      { day: 'Wed', value: 118, prev: 122 },
      { day: 'Thu', value: 125, prev: 130 },
      { day: 'Fri', value: 121, prev: 126 },
      { day: 'Sat', value: 119, prev: 124 },
      { day: 'Sun', value: 117, prev: 125 },
    ],
    monthly: [
      { day: 'Week 1', value: 122, prev: 126 },
      { day: 'Week 2', value: 120, prev: 124 },
      { day: 'Week 3', value: 119, prev: 123 },
      { day: 'Week 4', value: 118, prev: 125 },
    ],
    insight: 'Blood pressure trending down this week. Keep up the low-sodium diet.',
  },
  oxygen: {
    label: 'Oxygen Level', unit: '%', color: '#3B82F6',
    normal: { min: 95, max: 100 },
    current: 98, prev: 97, change: +1.0,
    daily: [
      { time: '6AM',  value: 97, prev: 96 },
      { time: '9AM',  value: 98, prev: 97 },
      { time: '12PM', value: 99, prev: 98 },
      { time: '3PM',  value: 98, prev: 97 },
      { time: '6PM',  value: 97, prev: 96 },
      { time: '9PM',  value: 98, prev: 97 },
    ],
    weekly: [
      { day: 'Mon', value: 98, prev: 97 },
      { day: 'Tue', value: 97, prev: 96 },
      { day: 'Wed', value: 99, prev: 97 },
      { day: 'Thu', value: 96, prev: 95 },
      { day: 'Fri', value: 98, prev: 97 },
      { day: 'Sat', value: 99, prev: 98 },
      { day: 'Sun', value: 98, prev: 97 },
    ],
    monthly: [
      { day: 'Week 1', value: 97, prev: 96 },
      { day: 'Week 2', value: 98, prev: 97 },
      { day: 'Week 3', value: 98, prev: 97 },
      { day: 'Week 4', value: 99, prev: 98 },
    ],
    insight: 'Oxygen saturation is excellent and stable throughout the week.',
  },
};

const tabs = [
  { key: 'glucose',       label: 'Glucose',       icon: <Droplets size={16} /> },
  { key: 'heartRate',     label: 'Heart Rate',     icon: <Heart size={16} />    },
  { key: 'bloodPressure', label: 'Blood Pressure', icon: <TrendingUp size={16} />},
  { key: 'oxygen',        label: 'Oxygen',         icon: <Wind size={16} />     },
];

export default function Reports() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = auth.currentUser;
  const reportRef = useRef(null);

  const [activeTab,    setActiveTab]    = useState('glucose');
  const [activePeriod, setActivePeriod] = useState('weekly');
  const [downloading,  setDownloading]  = useState(false);
  const [alerts,       setAlerts]       = useState([]);
  const [alertsOpen,   setAlertsOpen]   = useState(false);
  const [alertCount,   setAlertCount]   = useState(0);
  const [createdAt, setCreatedAt] = useState(null);

useEffect(() => {
  if (!user) return;
  setCreatedAt(user.metadata.creationTime);
}, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeAlerts(user.uid, (data) => {
      setAlerts(data);
      setAlertCount(data.filter(a => !a.read).length);
    });
    return () => unsub();
  }, [user]);

  const data = reportData[activeTab];

const getChartData = () => {
  const now = new Date();

  if (activePeriod === 'daily') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDay = now.getDay() === 0 ? 6 : now.getDay() - 1;
    return days.map((day, i) => ({
      day,
      value: i <= currentDay ? data.daily[i]?.value || null : null,
      prev:  i <= currentDay ? data.daily[i]?.prev  || null : null,
    }));
  }

  if (activePeriod === 'weekly') {
    const currentWeek = Math.floor((now.getDate() - 1) / 7);
    return ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, i) => ({
      day: week,
      value: i <= currentWeek ? data.monthly[i]?.value || null : null,
      prev:  i <= currentWeek ? data.monthly[i]?.prev  || null : null,
    }));
  }

  if (activePeriod === 'monthly') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startMonth = createdAt ? new Date(createdAt).getMonth() : now.getMonth();
    const currentMonth = now.getMonth();
    return months
      .filter((_, i) => i >= startMonth && i <= currentMonth)
      .map((month, i) => ({
        day: month,
        value: data.monthly[i % 4]?.value || null,
        prev:  data.monthly[i % 4]?.prev  || null,
      }));
  }

  return data.weekly;
};

const chartData = getChartData();
const xKey = 'day';
const periodLabel = activePeriod === 'daily' ? 'Today vs Yesterday'
  : activePeriod === 'monthly' ? 'This month vs Last month'
  : 'This week vs Last week';

  const avg = +(chartData.reduce((s, d) => s + d.value, 0) / chartData.length).toFixed(1);
  const min = Math.min(...chartData.map(d => d.value));
  const max = Math.max(...chartData.map(d => d.value));

  const handleDownloadPDF = async () => {
    const element = reportRef.current;
    if (!element) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#F8FAFC' });
      const imgData    = canvas.toDataURL('image/png');
      const pdf        = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth  = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth   = pageWidth;
      const imgHeight  = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position   = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`BioSense-${data.label}-${new Date().toLocaleDateString()}.pdf`);
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.bg }}>
      <Sidebar navigate={navigate} location={location} user={user} />
      <Box sx={{
        flexGrow: 1, ml: { md: '250px' },
        width: { xs: '100%', md: 'calc(100% - 250px)' },
        display: 'flex', flexDirection: 'column', minWidth: 0,
      }}>
        <MobileHeader title="Reports" alertCount={alertCount} onAlertClick={() => setAlertsOpen(true)} />

        <Box ref={reportRef} sx={{ p: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 } }}>

          {/* Десктоп топбар */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textMain, letterSpacing: '-0.5px' }}>
                Health Reports
              </Typography>
              <Typography sx={{ color: theme.textSub, mt: 0.3 }}>
                Detailed analytics and trends for your health metrics
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Button startIcon={<Download size={16} />} onClick={handleDownloadPDF} disabled={downloading}
                sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600,
                  bgcolor: theme.primary, color: 'white',
                  '&:hover': { bgcolor: '#1D4ED8' }, '&:disabled': { bgcolor: theme.textMuted } }}>
                {downloading ? 'Generating...' : 'Download PDF'}
              </Button>
              <Button startIcon={<Share2 size={16} />}
                onClick={() => { try { const el = document.createElement('textarea'); el.value = window.location.href; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); alert('Link copied!'); } catch { alert('Link: ' + window.location.href); } }}
                sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600,
                  border: `1px solid ${theme.border}`, color: theme.textSub,
                  bgcolor: theme.white, '&:hover': { bgcolor: theme.bg } }}>
                Share
              </Button>
            </Stack>
          </Box>

          {/* Мобильный топбар */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: theme.textMain }}>
              Health Reports
            </Typography>
            <Typography sx={{ color: theme.textSub, mt: 0.3, fontSize: '0.82rem' }}>
              Detailed analytics and trends
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button startIcon={<Download size={16} />} onClick={handleDownloadPDF} disabled={downloading}
                size="small" fullWidth
                sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600,
                  bgcolor: theme.primary, color: 'white',
                  '&:hover': { bgcolor: '#1D4ED8' }, '&:disabled': { bgcolor: theme.textMuted } }}>
                {downloading ? 'Generating...' : 'Download PDF'}
              </Button>
              <Button startIcon={<Share2 size={16} />} size="small" fullWidth
                onClick={() => { try { const el = document.createElement('textarea'); el.value = window.location.href; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); alert('Link copied!'); } catch { alert('Link: ' + window.location.href); } }}
                sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600,
                  border: `1px solid ${theme.border}`, color: theme.textSub,
                  bgcolor: theme.white, '&:hover': { bgcolor: theme.bg } }}>
                Share
              </Button>
            </Box>
          </Box>

          {/* ✅ Переключатель периода — Daily / Weekly / Monthly */}
          <Box sx={{
            display: 'flex', gap: 1, mb: 3,
            overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' },
          }}>
            {[
              { key: 'daily',   label: '📅 Daily'   },
              { key: 'weekly',  label: '📆 Weekly'  },
              { key: 'monthly', label: '🗓️ Monthly' },
            ].map(period => (
              <Box key={period.key} onClick={() => setActivePeriod(period.key)} sx={{
                px: 2.5, py: 0.8, borderRadius: '20px', cursor: 'pointer', flexShrink: 0,
                bgcolor: activePeriod === period.key ? theme.primary : theme.white,
                color:   activePeriod === period.key ? 'white' : theme.textSub,
                border:  `1px solid ${activePeriod === period.key ? theme.primary : theme.border}`,
                fontSize: '0.85rem', fontWeight: 600,
                transition: 'all 0.15s',
              }}>
                {period.label}
              </Box>
            ))}
          </Box>

          {/* Десктоп табы */}
          <Paper elevation={0} sx={{
            mb: 3, borderRadius: '20px', border: `1px solid ${theme.border}`,
            bgcolor: theme.white, p: 0.5, display: { xs: 'none', md: 'inline-flex' }, gap: 0.5
          }}>
            {tabs.map(tab => (
              <Button key={tab.key} onClick={() => setActiveTab(tab.key)}
                startIcon={tab.icon}
                sx={{
                  borderRadius: '14px', textTransform: 'none', fontWeight: 600,
                  fontSize: '0.85rem', px: 2, py: 1,
                  bgcolor: activeTab === tab.key ? theme.primary : 'transparent',
                  color:   activeTab === tab.key ? 'white' : theme.textSub,
                  '&:hover': { bgcolor: activeTab === tab.key ? '#1D4ED8' : theme.bg },
                }}>
                {tab.label}
              </Button>
            ))}
          </Paper>

          {/* Мобильный скролл табов */}
          <Box sx={{
            display: { xs: 'flex', md: 'none' }, gap: 1, mb: 3,
            overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' },
          }}>
            {tabs.map(tab => (
              <Button key={tab.key} onClick={() => setActiveTab(tab.key)}
                startIcon={tab.icon}
                sx={{
                  borderRadius: '14px', textTransform: 'none', fontWeight: 600,
                  fontSize: '0.82rem', px: 1.5, py: 0.8, flexShrink: 0,
                  bgcolor: activeTab === tab.key ? theme.primary : theme.white,
                  color:   activeTab === tab.key ? 'white' : theme.textSub,
                  border: `1px solid ${activeTab === tab.key ? theme.primary : theme.border}`,
                  '&:hover': { bgcolor: activeTab === tab.key ? '#1D4ED8' : theme.bg },
                }}>
                {tab.label}
              </Button>
            ))}
          </Box>

          <Grid container spacing={3}>

            {/* График */}
            <Grid item xs={12} md={8}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: '24px',
                border: `1px solid ${theme.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: theme.textMain }}>
                      {data.label} — {activePeriod === 'daily' ? 'Daily' : activePeriod === 'monthly' ? 'Monthly' : 'Weekly'} Trend
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', color: theme.textSub }}>
                      {periodLabel}
                    </Typography>
                  </Box>
                  <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 12, height: 3, bgcolor: data.color, borderRadius: 2 }} />
                      <Typography sx={{ fontSize: '0.75rem', color: theme.textSub }}>Current</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 12, height: 3, bgcolor: theme.textMuted, borderRadius: 2 }} />
                      <Typography sx={{ fontSize: '0.75rem', color: theme.textSub }}>Previous</Typography>
                    </Box>
                  </Box>
                </Box>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={data.color} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={data.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: theme.textMuted }}
                      axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: theme.textMuted }}
                      axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: `1px solid ${theme.border}`, fontSize: 12 }}
                      formatter={(v, n) => [`${v} ${data.unit}`, n === 'value' ? 'Current' : 'Previous']} />
                    <ReferenceLine y={data.normal.max} stroke={theme.warning} strokeDasharray="4 4"
                      label={{ value: 'Upper limit', fontSize: 10, fill: theme.warning }} />
                    <Area type="monotone" dataKey="prev" stroke={theme.textMuted} strokeWidth={1.5}
                      strokeDasharray="4 4" fill="none" dot={false} />
                    <Area type="monotone" dataKey="value" stroke={data.color} strokeWidth={2.5}
                      fill="url(#grad)" dot={{ fill: data.color, r: 4, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Правая колонка */}
            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                  <Typography sx={{ fontWeight: 700, color: theme.textMain, mb: 2 }}>
                    {activePeriod === 'daily' ? 'Daily' : activePeriod === 'monthly' ? 'Monthly' : 'Weekly'} Summary
                  </Typography>
                  <Grid container spacing={1.5}>
                    {[
                      { label: 'Average',   value: `${avg} ${data.unit}`, color: data.color },
                      { label: 'Prev. Avg', value: `${data.prev} ${data.unit}`, color: theme.textMuted },
                      { label: 'Change',    value: `${data.change > 0 ? '+' : ''}${data.change}%`,
                        color: data.change < 0 ? theme.success : theme.danger },
                      { label: 'Range',     value: `${min}–${max}`, color: theme.textSub },
                    ].map(stat => (
                      <Grid item xs={6} key={stat.label}>
                        <Box sx={{ p: 1.5, bgcolor: theme.bg, borderRadius: '14px' }}>
                          <Typography sx={{ fontSize: '0.7rem', color: theme.textMuted, fontWeight: 600,
                            textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {stat.label}
                          </Typography>
                          <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: stat.color, mt: 0.3 }}>
                            {stat.value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>

                <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                  <Typography sx={{ fontWeight: 700, color: theme.textMain, mb: 1.5 }}>
                    Normal Range
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: '0.8rem', color: theme.textSub }}>
                      {data.normal.min} – {data.normal.max} {data.unit}
                    </Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: theme.success }}>
                      ✓ In Range
                    </Typography>
                  </Box>
                  <Box sx={{ height: 8, bgcolor: theme.bg, borderRadius: 4, overflow: 'hidden' }}>
                    <Box sx={{
                      height: '100%', borderRadius: 4,
                      bgcolor: avg >= data.normal.min && avg <= data.normal.max ? theme.success : theme.warning,
                      width: `${Math.min(100, ((avg - data.normal.min) / (data.normal.max - data.normal.min)) * 100)}%`,
                      transition: 'width 0.5s',
                    }} />
                  </Box>
                </Paper>

                <Paper elevation={0} sx={{ p: 3, borderRadius: '24px',
                  background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)',
                  border: '1px solid #BFDBFE' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: theme.primary,
                    textTransform: 'uppercase', letterSpacing: '1px', mb: 1 }}>
                    Key Insight
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: theme.textMain, lineHeight: 1.7 }}>
                    💡 {data.insight}
                  </Typography>
                </Paper>
              </Stack>
            </Grid>

            {/* Activity Summary */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                <Typography sx={{ fontWeight: 700, color: theme.textMain, mb: 2 }}>
                  {activePeriod === 'daily' ? 'Daily' : activePeriod === 'monthly' ? 'Monthly' : 'Weekly'} Activity Summary
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { label: activePeriod === 'daily' ? 'Steps Today' : 'Avg Daily Steps', value: '8,432', unit: 'steps', color: '#10B981', change: '+12%' },
                    { label: activePeriod === 'daily' ? 'Sleep Last Night' : 'Avg Sleep',   value: '7.2',   unit: 'hrs',   color: '#8B5CF6', change: '+5%'  },
                    { label: activePeriod === 'daily' ? 'Calories Today' : 'Avg Calories',  value: '2,140', unit: 'kcal',  color: '#F59E0B', change: '-3%'  },
                    { label: activePeriod === 'daily' ? 'Active Hours' : 'Active Days',     value: activePeriod === 'daily' ? '3' : '5', unit: activePeriod === 'daily' ? '/ 8' : '/ 7', color: '#3B82F6', change: '71%' },
                  ].map(s => (
                    <Grid item xs={6} md={3} key={s.label}>
                      <Box sx={{ p: 2, bgcolor: theme.bg, borderRadius: '16px', textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>
                          {s.value}
                          <Typography component="span" sx={{ fontSize: '0.8rem', color: theme.textMuted, fontWeight: 600 }}>
                            {' '}{s.unit}
                          </Typography>
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: theme.textSub, fontWeight: 600 }}>
                          {s.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, mt: 0.5,
                          color: s.change.startsWith('+') ? theme.success : s.change.startsWith('-') ? theme.danger : theme.textSub }}>
                          {s.change} vs {activePeriod === 'daily' ? 'yesterday' : activePeriod === 'monthly' ? 'last month' : 'last week'}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

          </Grid>
        </Box>
      </Box>

      <AlertsModal
        open={alertsOpen}
        onClose={() => setAlertsOpen(false)}
        alerts={alerts}
        onMarkRead={(id) => markAlertRead(user.uid, id)}
        onMarkAllRead={() => markAllAlertsRead(user.uid)}
      />
      <BottomNav />
    </Box>
  );
}