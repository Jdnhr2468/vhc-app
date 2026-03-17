import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Avatar,
  List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Switch, Slider, CircularProgress, Drawer, Divider, IconButton
} from '@mui/material';
import {
  Bell, LayoutGrid, BarChart3, Settings,
  LogOut, ChevronRight, Smartphone, Heart, Droplets, Wind, Zap,
  PersonStanding, Flame, Check, X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../services/firebase';
import { getUserSettings, saveUserSettings, subscribeAlerts, markAlertRead } from '../services/firestoreService';
import BottomNav    from '../components/layout/BottomNav';
import MobileHeader from '../components/layout/MobileHeader';
import { useLanguage } from '../context/LanguageContext';
import BioSenseLogo from '../components/BioSenseLogo';


const theme = {
  bg:        '#F2F2F7',
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
  separator: '#E5E5EA',
};

const dashboardCards = [
  { key: 'heartRate', label: 'Heart Rate',      icon: <Heart size={16} />,          color: '#EF4444' },
  { key: 'bloodPressure', label: 'Blood Pressure',  icon: <Zap size={16} />,            color: '#F59E0B' },
  { key: 'oxygenLevel', label: 'Oxygen Level',    icon: <Wind size={16} />,           color: '#3B82F6' },
  { key: 'glucose',   label: 'Glucose',         icon: <Droplets size={16} />,       color: '#8B5CF6' },
  { key: 'stepsToday', label: 'Steps Today',     icon: <PersonStanding size={16} />, color: '#10B981' },
  { key: 'caloriesBurned', label: 'Calories Burned', icon: <Flame size={16} />,          color: '#F59E0B' },
];


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



function AppleSection({ label, children, mb = 3 }) {
  return (
    <Box sx={{ mb }}>
      {label && (
        <Typography sx={{
          fontSize: '0.72rem', fontWeight: 600,
          color: theme.textMuted, textTransform: 'uppercase',
          letterSpacing: '0.5px', px: 1, mb: 0.8,
        }}>
          {label}
        </Typography>
      )}
      <Paper elevation={0} sx={{
        borderRadius: '14px',
        border: `1px solid ${theme.separator}`,
        bgcolor: theme.white,
        overflow: 'hidden',
      }}>
        {children}
      </Paper>
    </Box>
  );
}

function AppleRow({ icon, iconBg, label, desc, right, onClick, divider = true, danger = false }) {
  return (
    <>
      <Box onClick={onClick} sx={{
        display: 'flex', alignItems: 'center',
        px: 2, py: 1.4, gap: 1.5,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { bgcolor: '#F9F9F9' } : {},
        transition: 'background 0.15s',
      }}>
        {icon && (
          <Box sx={{
            width: 30, height: 30, borderRadius: '8px',
            bgcolor: iconBg || theme.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {React.cloneElement(icon, { size: 16, color: 'white' })}
          </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{
            fontSize: '0.9rem', fontWeight: 500,
            color: danger ? theme.danger : theme.textMain,
          }}>
            {label}
          </Typography>
          {desc && (
            <Typography sx={{ fontSize: '0.75rem', color: theme.textMuted, mt: 0.1 }}>
              {desc}
            </Typography>
          )}
        </Box>
        {right && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            {right}
          </Box>
        )}
      </Box>
      {divider && <Divider sx={{ ml: icon ? '58px' : 2, borderColor: theme.separator }} />}
    </>
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

export default function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user     = auth.currentUser;

  // ✅ useLanguage вверху, ДО useState
  const { t, setLanguage: setGlobalLanguage, setFontSize: setGlobalFontSize } = useLanguage();

  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [languageLocal, setLanguageLocal] = useState(DEFAULT_SETTINGS.language);
  const [units,        setUnits]        = useState(DEFAULT_SETTINGS.units);
  const [fontSize,     setFontSize]     = useState(DEFAULT_SETTINGS.fontSize);
  const [notifTime,    setNotifTime]    = useState(DEFAULT_SETTINGS.notifTime);
  const [notifTypes,   setNotifTypes]   = useState(DEFAULT_SETTINGS.notifTypes);
  const [thresholds,   setThresholds]   = useState(DEFAULT_SETTINGS.thresholds);
  const [visibleCards, setVisibleCards] = useState(DEFAULT_SETTINGS.visibleCards);
  const [activeTab,    setActiveTab]    = useState('language');
  const [alerts,     setAlerts]     = useState([]);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);


  // ✅ settingsTabs внутри компонента после useLanguage
  const settingsTabs = [
    { key: 'language',      label: t.language,      emoji: '' },
    { key: 'units',         label: t.units,         emoji: '' },
    { key: 'accessibility', label: t.accessibility, emoji: '' },
    { key: 'notifications', label: t.notifications, emoji: '' },
    { key: 'thresholds',    label: t.thresholds,    emoji: '' },
    { key: 'dashboard',     label: t.dashboardCards,emoji: '' },
    { key: 'about',         label: t.about,         emoji: 'ℹ️' },
  ];

useEffect(() => {
  if (!user) return;
  const unsub = subscribeAlerts(user.uid, (data) => {
    setAlerts(data);
    setAlertCount(data.filter(a => !a.read).length);
  });
  return () => unsub();
}, [user]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const data = await getUserSettings(user.uid);
      if (data) {
        setLanguageLocal(data.language     || DEFAULT_SETTINGS.language);
        setUnits(        data.units        || DEFAULT_SETTINGS.units);
        setFontSize(     data.fontSize     || DEFAULT_SETTINGS.fontSize);
        setNotifTime(    data.notifTime    || DEFAULT_SETTINGS.notifTime);
        setNotifTypes(   data.notifTypes   || DEFAULT_SETTINGS.notifTypes);
        setThresholds(   data.thresholds   || DEFAULT_SETTINGS.thresholds);
        setVisibleCards( data.visibleCards || DEFAULT_SETTINGS.visibleCards);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    // ✅ Обновляем глобальный язык и шрифт
    setGlobalLanguage(languageLocal);
    setGlobalFontSize(fontSize);
    const ok = await saveUserSettings(user.uid, {
      language: languageLocal, units, fontSize, notifTime, notifTypes, thresholds, visibleCards,
    });
    setSaving(false);
    if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  };

  const toggleCard = (key) => {
  const active = Object.values(visibleCards).filter(Boolean).length;
  if (visibleCards[key] && active <= 3) return;
  setVisibleCards(p => ({ ...p, [key]: !p[key] }));
};

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.bg }}>
      <Sidebar navigate={navigate} location={location} user={user} />

      <Box sx={{ flexGrow: 1, ml: { md: '250px' }, width: '100%', display: 'flex', flexDirection: 'column' }}>
        <MobileHeader title="Settings" alertCount={alertCount} onAlertClick={() => setAlertsOpen(true)} />

        {/* Десктоп */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1 }}>
          <Box sx={{ width: 220, flexShrink: 0, borderRight: `1px solid ${theme.border}`, pt: 4, px: 2, bgcolor: theme.bg }}>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: theme.textMain, px: 1, mb: 2 }}>
              {t.settings}
            </Typography>
            {settingsTabs.map(tab => (
              <Box key={tab.key} onClick={() => setActiveTab(tab.key)} sx={{
                px: 1.5, py: 1, borderRadius: '10px', cursor: 'pointer', mb: 0.5,
                display: 'flex', alignItems: 'center', gap: 1,
                bgcolor: activeTab === tab.key ? theme.white : 'transparent',
                border: activeTab === tab.key ? `1px solid ${theme.border}` : '1px solid transparent',
                color: activeTab === tab.key ? theme.primary : theme.textSub,
                transition: 'all 0.15s',
                '&:hover': { bgcolor: theme.white, color: theme.textMain },
              }}>
              
                <Typography sx={{ fontSize: '1rem' }}>{tab.emoji}</Typography>
                <Typography sx={{ fontSize: '0.88rem', fontWeight: activeTab === tab.key ? 700 : 500, color: 'inherit' }}>
                  {tab.label}
                </Typography>
              </Box>
            ))}
          </Box>


          <Box sx={{ flex: 1, p: 4, overflowY: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: theme.textMain }}>
                {settingsTabs.find(tab => tab.key === activeTab)?.label}
              </Typography>
              <Button onClick={handleSave} disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : saved ? <Check size={16} /> : null}
                sx={{
                  bgcolor: saved ? theme.success : theme.primary, color: 'white',
                  borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3,
                  '&:hover': { bgcolor: saved ? '#059669' : '#1D4ED8' },
                }}>
                {saving ? t.saving : saved ? t.saved : t.saveChanges}
              </Button>
            </Box>
            <TabContent
              activeTab={activeTab}
              language={languageLocal} setLanguage={setLanguageLocal}
              units={units} setUnits={setUnits}
              fontSize={fontSize} setFontSize={setFontSize}
              notifTime={notifTime} setNotifTime={setNotifTime}
              notifTypes={notifTypes} setNotifTypes={setNotifTypes}
              thresholds={thresholds} setThresholds={setThresholds}
              visibleCards={visibleCards} toggleCard={toggleCard}
            />
          </Box>
        </Box>

        {/* Мобильный */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, p: 2, pb: 10 }}>
          <Box sx={{
  display: 'flex', gap: 1, overflowX: 'auto', pb: 1.5, mb: 2,
  '&::-webkit-scrollbar': { display: 'none' },
}}>
  {settingsTabs.map(tab => (
    <Box key={tab.key} onClick={() => setActiveTab(tab.key)} sx={{
      flexShrink: 0, px: 2, py: 0.8, borderRadius: '20px', cursor: 'pointer',
      bgcolor: activeTab === tab.key ? theme.primary : theme.white,
      color:   activeTab === tab.key ? 'white' : theme.textSub,
      border:  `1px solid ${activeTab === tab.key ? theme.primary : theme.border}`,
      fontSize: '0.8rem', fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: 0.5,
    }}>
      <span>{tab.emoji}</span>
      <span>{tab.label}</span>
    </Box>
  ))}
</Box>


          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button onClick={handleSave} disabled={saving} size="small"
              startIcon={saving ? <CircularProgress size={14} color="inherit" /> : saved ? <Check size={14} /> : null}
              sx={{
                bgcolor: saved ? theme.success : theme.primary, color: 'white',
                borderRadius: '12px', textTransform: 'none', fontWeight: 700,
                '&:hover': { bgcolor: saved ? '#059669' : '#1D4ED8' },
              }}>
              {saving ? t.saving : saved ? t.saved : t.saveChanges}
            </Button>
          </Box>

          <TabContent
            activeTab={activeTab}
            language={languageLocal} setLanguage={setLanguageLocal}
            units={units} setUnits={setUnits}
            fontSize={fontSize} setFontSize={setFontSize}
            notifTime={notifTime} setNotifTime={setNotifTime}
            notifTypes={notifTypes} setNotifTypes={setNotifTypes}
            thresholds={thresholds} setThresholds={setThresholds}
            visibleCards={visibleCards} toggleCard={toggleCard}
          />
        </Box>
      </Box>
      <AlertsModal
  open={alertsOpen}
  onClose={() => setAlertsOpen(false)}
  alerts={alerts}
  onMarkRead={(id) => markAlertRead(user.uid, id)}
/>
      <BottomNav />
    </Box>
  );
}


function TabContent({ activeTab, language, setLanguage, units, setUnits, fontSize, setFontSize,
  notifTime, setNotifTime, notifTypes, setNotifTypes, thresholds, setThresholds,
  visibleCards, toggleCard }) {

  return (
    <>

      {activeTab === 'language' && (
        <AppleSection label="Language">
          {[
            { key: 'english', label: 'English', flag: '🇬🇧' },
            { key: 'russian', label: 'Russian', flag: '🇷🇺' },
            { key: 'kazakh',  label: 'Kazakh',  flag: '🇰🇿' },
          ].map((lang, i, arr) => (
            <AppleRow key={lang.key} label={`${lang.flag}  ${lang.label}`}
              divider={i < arr.length - 1}
              onClick={() => setLanguage(lang.key)}
              right={language === lang.key ? <Check size={18} color={theme.primary} /> : null}
            />
          ))}
        </AppleSection>
      )}


      {activeTab === 'units' && (
        <AppleSection label="Units of Measurement">
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: theme.textSub, mb: 1.2 }}>Blood Glucose</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {[{ key: 'mmol', label: 'mmol/L', desc: 'International' }, { key: 'mgdl', label: 'mg/dL', desc: 'USA' }].map(u => (
                <Box key={u.key} onClick={() => setUnits(p => ({ ...p, glucose: u.key }))} sx={{
                  flex: 1, p: 1.2, borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                  border: `2px solid ${units.glucose === u.key ? theme.primary : theme.separator}`,
                  bgcolor: units.glucose === u.key ? theme.primaryBg : '#F9F9F9',
                  transition: 'all 0.2s',
                }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: units.glucose === u.key ? theme.primary : theme.textMain }}>{u.label}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: theme.textMuted }}>{u.desc}</Typography>
                </Box>
              ))}
            </Box>
            <Divider sx={{ mb: 1.5, borderColor: theme.separator }} />
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: theme.textSub, mb: 1.2 }}>Weight & Height</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[{ key: 'kg', label: 'kg / cm', desc: 'Metric' }, { key: 'lbs', label: 'lbs / ft', desc: 'Imperial' }].map(u => (
                <Box key={u.key} onClick={() => setUnits(p => ({ ...p, weight: u.key }))} sx={{
                  flex: 1, p: 1.2, borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                  border: `2px solid ${units.weight === u.key ? theme.primary : theme.separator}`,
                  bgcolor: units.weight === u.key ? theme.primaryBg : '#F9F9F9',
                  transition: 'all 0.2s',
                }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: units.weight === u.key ? theme.primary : theme.textMain }}>{u.label}</Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: theme.textMuted }}>{u.desc}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </AppleSection>
      )}


      {activeTab === 'accessibility' && (
        <AppleSection label="Accessibility">
          <Box sx={{ px: 2, py: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.88rem', color: theme.textSub }}>Text Size</Typography>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: theme.primary }}>
                {['Small', 'Medium', 'Large', 'X-Large'][fontSize - 1]}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontSize: '0.75rem', color: theme.textMuted }}>A</Typography>
              <Slider value={fontSize} min={1} max={4} step={1} onChange={(_, v) => setFontSize(v)}
                sx={{ color: theme.primary, flex: 1,
                  '& .MuiSlider-thumb': { width: 20, height: 20 },
                  '& .MuiSlider-track': { height: 4 },
                  '& .MuiSlider-rail': { height: 4 },
                }} />
              <Typography sx={{ fontSize: '1rem', color: theme.textMuted, fontWeight: 700 }}>A</Typography>
            </Box>
            <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#F9F9F9', borderRadius: '10px' }}>
              <Typography sx={{ fontWeight: 600, color: theme.textMain, fontSize: `${0.75 + (fontSize - 1) * 0.1}rem` }}>
                Heart Rate: 72 bpm — Normal
              </Typography>
              <Typography sx={{ color: theme.textSub, fontSize: `${0.65 + (fontSize - 1) * 0.1}rem` }}>
                Last updated 3 seconds ago
              </Typography>
            </Box>
          </Box>
        </AppleSection>
      )}


      {activeTab === 'notifications' && (
        <>
          <AppleSection label="Notification Time">
            {[
              { key: 'morning',   label: 'Morning',   emoji: '🌅', desc: '8:00 AM' },
              { key: 'afternoon', label: 'Afternoon', emoji: '☀️', desc: '2:00 PM' },
              { key: 'evening',   label: 'Evening',   emoji: '🌙', desc: '8:00 PM' },
              { key: 'realtime',  label: 'Real-time', emoji: '⚡', desc: 'Instant'  },
            ].map((item, i, arr) => (
              <AppleRow key={item.key} label={`${item.emoji}  ${item.label}`} desc={item.desc}
                divider={i < arr.length - 1} onClick={() => setNotifTime(item.key)}
                right={notifTime === item.key ? <Check size={18} color={theme.primary} /> : null}
              />
            ))}
          </AppleSection>
          <AppleSection label="Notification Types">
            {[
              { key: 'critical',  label: 'Critical Alerts',   desc: 'Abnormal biomarker values', iconBg: theme.danger  },
              { key: 'reminders', label: 'Daily Reminders',   desc: 'Medication & activity',     iconBg: theme.warning },
              { key: 'goals',     label: 'Goal Achievements', desc: 'When you hit your targets', iconBg: theme.success },
              { key: 'reports',   label: 'Weekly Reports',    desc: 'Summary every Monday',      iconBg: '#8B5CF6'     },
            ].map((n, i, arr) => (
              <AppleRow key={n.key} icon={<Bell size={16} />} iconBg={n.iconBg}
                label={n.label} desc={n.desc} divider={i < arr.length - 1}
                right={<Switch checked={notifTypes[n.key]} size="small"
                  onChange={() => setNotifTypes(p => ({ ...p, [n.key]: !p[n.key] }))}
                  sx={{ '& .MuiSwitch-thumb': { boxShadow: 'none' } }} />}
              />
            ))}
          </AppleSection>
        </>
      )}


      {activeTab === 'thresholds' && (
        <AppleSection label="Alert Thresholds">
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography sx={{ fontSize: '0.78rem', color: theme.textMuted, mb: 2 }}>
              You will receive alerts when values go outside these ranges.
            </Typography>
            {[
              { key: 'heartRate', label: 'Heart Rate',  unit: 'bpm',    color: '#EF4444', min: 40, max: 180 },
              { key: 'glucose',   label: 'Glucose',     unit: 'mmol/L', color: '#8B5CF6', min: 2,  max: 15  },
              { key: 'oxygen',    label: 'Oxygen',      unit: '%',      color: '#3B82F6', min: 85, max: 100 },
              { key: 'systolic',  label: 'Systolic BP', unit: 'mmHg',   color: '#F59E0B', min: 70, max: 200 },
            ].map((metric, i, arr) => (
              <Box key={metric.key} sx={{ mb: i < arr.length - 1 ? 2.5 : 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: theme.textMain }}>{metric.label}</Typography>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: metric.color }}>
                    {thresholds[metric.key].min} – {thresholds[metric.key].max} {metric.unit}
                  </Typography>
                </Box>
                <Slider value={[thresholds[metric.key].min, thresholds[metric.key].max]}
                  onChange={(_, val) => setThresholds(p => ({ ...p, [metric.key]: { min: val[0], max: val[1] } }))}
                  min={metric.min} max={metric.max} step={metric.key === 'glucose' ? 0.1 : 1}
                  sx={{ color: metric.color, height: 4,
                    '& .MuiSlider-thumb': { width: 16, height: 16, boxShadow: 'none' },
                    '& .MuiSlider-track': { height: 4 },
                    '& .MuiSlider-rail': { height: 4 },
                  }} />
                {i < arr.length - 1 && <Divider sx={{ mt: 1, borderColor: theme.separator }} />}
              </Box>
            ))}
          </Box>
        </AppleSection>
      )}


      {activeTab === 'dashboard' && (
        <AppleSection label="Dashboard Cards">
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography sx={{ fontSize: '0.78rem', color: theme.textMuted, mb: 1.5 }}>
              Choose which cards appear on your dashboard (min. 2)
            </Typography>
            {dashboardCards.map((card, i, arr) => (
              <Box key={card.key}>
                <Box onClick={() => toggleCard(card.key)} sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, py: 1.1, cursor: 'pointer',
                  opacity: visibleCards[card.key] ? 1 : 0.45, transition: 'opacity 0.2s',
                }}>
                  <Box sx={{ width: 28, height: 28, borderRadius: '7px', bgcolor: `${card.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                    {card.icon}
                  </Box>
                  <Typography sx={{ flex: 1, fontSize: '0.88rem', fontWeight: 500, color: theme.textMain }}>
                    {card.label}
                  </Typography>
                  {visibleCards[card.key]
                    ? <Check size={18} color={theme.primary} />
                    : <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${theme.separator}` }} />}
                </Box>
                {i < arr.length - 1 && <Divider sx={{ borderColor: theme.separator }} />}
              </Box>
            ))}
            <Typography sx={{ fontSize: '0.72rem', color: theme.textMuted, mt: 1.5 }}>
  {dashboardCards.filter(card => visibleCards[card.key]).length} of {dashboardCards.length} cards visible
</Typography>
          </Box>
        </AppleSection>
      )}


      {activeTab === 'about' && (
        <>
          <AppleSection label="About">
            <AppleRow label="Version"  right={<Typography sx={{ fontSize: '0.85rem', color: theme.textMuted }}>1.0.0</Typography>} divider />
            <AppleRow label="Build"    right={<Typography sx={{ fontSize: '0.85rem', color: theme.textMuted }}>March 2026</Typography>} divider />
            <AppleRow label="Platform" right={<Typography sx={{ fontSize: '0.85rem', color: theme.textMuted }}>React Web</Typography>} divider={false} />
          </AppleSection>
          <AppleSection label="Team">
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: theme.primary, mb: 1 }}>
                Aktobe Group 5 — BioSense
              </Typography>
              {[
                { name: 'Alisher Zhalmukhambetov', role: 'PM'       },
                { name: 'Moldir Aitmagambetova',   role: 'UI/UX'    },
                { name: 'Miras Kuramysov',         role: 'Backend'  },
                { name: 'Aman Alzhaparov',         role: 'QA'       },
                { name: 'Aliya Khamzina',          role: 'Database' },
                { name: 'Miras Ersaiynov',         role: 'Tester'   },
              ].map((m, i, arr) => (
                <Box key={m.name} sx={{ display: 'flex', justifyContent: 'space-between',
                  py: 1, borderBottom: i < arr.length - 1 ? `1px solid ${theme.separator}` : 'none' }}>
                  <Typography sx={{ fontSize: '0.82rem', color: theme.textMain }}>{m.name}</Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: theme.textMuted, fontWeight: 600 }}>{m.role}</Typography>
                </Box>
              ))}
              <Typography sx={{ fontSize: '0.72rem', color: theme.textMuted, mt: 1.5 }}>
                Heriot-Watt University · Software Engineering CW2
              </Typography>
            </Box>
          </AppleSection>
        </>
      )}
    </>
  );
}