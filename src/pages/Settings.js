import React, { useState, useEffect } from 'react';
import {
Box, Typography, Paper, Button, Avatar,
List, ListItem, ListItemButton, ListItemIcon,
ListItemText, Switch, Slider, CircularProgress, Divider
} from '@mui/material';
import {
Activity, Bell, LayoutGrid, BarChart3, Settings,
LogOut, ChevronRight, Smartphone, Heart, Droplets, Wind, Zap,
PersonStanding, Flame, Check
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../services/firebase';
import { getUserSettings, saveUserSettings } from '../services/firestoreService';
import BottomNav    from '../components/layout/BottomNav';
import MobileHeader from '../components/layout/MobileHeader';

const theme = {
bg:        '#F2F2F7', // Apple-style light grey bg
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
separator: '#E5E5EA', // Apple separator color
};

const menuItems = [
{ label: 'Dashboard', icon: <LayoutGrid />, path: '/dashboard' },
{ label: 'Devices',   icon: <Smartphone />, path: '/devices'   },
{ label: 'Alerts',    icon: <Bell />,        path: '/alerts'    },
{ label: 'Reports',   icon: <BarChart3 />,   path: '/reports'   },
{ label: 'Settings',  icon: <Settings />,    path: '/settings'  },
];

const dashboardCards = [
{ key: 'heartRate', label: 'Heart Rate',      icon: <Heart size={16} />,          color: '#EF4444' },
{ key: 'bp',        label: 'Blood Pressure',  icon: <Zap size={16} />,            color: '#F59E0B' },
{ key: 'oxygen',    label: 'Oxygen Level',    icon: <Wind size={16} />,           color: '#3B82F6' },
{ key: 'glucose',   label: 'Glucose',         icon: <Droplets size={16} />,       color: '#8B5CF6' },
{ key: 'steps',     label: 'Steps Today',     icon: <PersonStanding size={16} />, color: '#10B981' },
{ key: 'calories',  label: 'Calories Burned', icon: <Flame size={16} />,          color: '#F59E0B' },
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

const settingsTabs = [
  { key: 'language',      label: 'Language'         },
  { key: 'units',         label: 'Units'            },
  { key: 'accessibility', label: 'Accessibility'    },
  { key: 'notifications', label: 'Notifications'    },
  { key: 'thresholds',    label: 'Alert Thresholds' },
  { key: 'dashboard',     label: 'Dashboard Cards'  },
  { key: 'about',         label: 'About'            },
];

// Apple-style section wrapper
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

// Apple-style row
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

function Sidebar({ navigate, location, user }) {
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

const [language,     setLanguage]     = useState(DEFAULT_SETTINGS.language);
const [units,        setUnits]        = useState(DEFAULT_SETTINGS.units);
const [fontSize,     setFontSize]     = useState(DEFAULT_SETTINGS.fontSize);
const [notifTime,    setNotifTime]    = useState(DEFAULT_SETTINGS.notifTime);
const [notifTypes,   setNotifTypes]   = useState(DEFAULT_SETTINGS.notifTypes);
const [thresholds,   setThresholds]   = useState(DEFAULT_SETTINGS.thresholds);
const [visibleCards, setVisibleCards] = useState(DEFAULT_SETTINGS.visibleCards);

const [activeTab, setActiveTab] = useState('language');

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

const handleSave = async () => {
setSaving(true);
const ok = await saveUserSettings(user.uid, {
language, units, fontSize, notifTime, notifTypes, thresholds, visibleCards,
});
setSaving(false);
if (ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
};

const toggleCard = (key) => {
const active = Object.values(visibleCards).filter(Boolean).length;
if (visibleCards[key] && active <= 2) return;
setVisibleCards(p => ({ p, [key]: !p[key] }));
};

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
      <MobileHeader title="Settings" />

      <Box sx={{ p: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 }, overflowY: 'hidden' }}>

        {/* ── Внутренний навигатор Settings ── */}
        <Box sx={{
          width: 200, flexShrink: 0,
          borderRight: `1px solid ${theme.border}`,
          pt: 4, px: 1,
          display: { xs: 'none', md: 'block' },
        }}>
          <Typography sx={{
            fontSize: '1.4rem', fontWeight: 700,
            color: theme.textMain, px: 1.5, mb: 2,
          }}>
            Settings
          </Typography>

          {settingsTabs.map(tab => (
            <Box key={tab.key} onClick={() => setActiveTab(tab.key)} sx={{
              px: 1.5, py: 1,
              borderRadius: '8px',
              cursor: 'pointer',
              mb: 0.5,
              bgcolor: activeTab === tab.key ? theme.white : 'transparent',
              border: activeTab === tab.key ? `1px solid ${theme.border}` : '1px solid transparent',
              color: activeTab === tab.key ? theme.textMain : theme.textSub,
              fontWeight: activeTab === tab.key ? 600 : 400,
              fontSize: '0.9rem',
              '&:hover': { bgcolor: theme.white, color: theme.textMain },
              transition: 'all 0.15s',
            }}>
              {tab.label}
            </Box>
          ))}
        </Box>

        {/* ── Контент вкладки ── */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 }, minWidth: 0 }}>

          {/* Save button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button onClick={handleSave} disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : saved ? <Check size={16} /> : null}
              sx={{
                bgcolor: saved ? theme.success : theme.primary, color: 'white',
                borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3,
                '&:hover': { bgcolor: saved ? '#059669' : '#1D4ED8' },
                transition: 'background 0.3s',
              }}>
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </Box>

          {/* LANGUAGE */}
          {activeTab === 'language' && (
            <AppleSection label="Language">
              {[
                { key: 'english', label: 'English', flag: '🇬🇧' },
                { key: 'russian', label: 'Russian', flag: '🇷🇺' },
                { key: 'kazakh',  label: 'Kazakh',  flag: '🇰🇿' },
              ].map((lang, i, arr) => (
                <AppleRow
                  key={lang.key}
                  label={`${lang.flag}  ${lang.label}`}
                  divider={i < arr.length - 1}
                  onClick={() => setLanguage(lang.key)}
                  right={language === lang.key ? <Check size={18} color={theme.primary} /> : null}
                />
              ))}
            </AppleSection>
          )}

          {/* UNITS */}
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

          {/* ACCESSIBILITY */}
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

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <>
              <AppleSection label="Notification Time">
                {[
                  { key: 'morning',   label: 'Morning',   emoji: '🌅', desc: '8:00 AM' },
                  { key: 'afternoon', label: 'Afternoon', emoji: '☀️', desc: '2:00 PM' },
                  { key: 'evening',   label: 'Evening',   emoji: '🌙', desc: '8:00 PM' },
                  { key: 'realtime',  label: 'Real-time', emoji: '⚡', desc: 'Instant'  },
                ].map((t, i, arr) => (
                  <AppleRow key={t.key} label={`${t.emoji}  ${t.label}`} desc={t.desc}
                    divider={i < arr.length - 1} onClick={() => setNotifTime(t.key)}
                    right={notifTime === t.key ? <Check size={18} color={theme.primary} /> : null}
                  />
                ))}
              </AppleSection>
              <AppleSection label="Notification Types">
                {[
                  { key: 'critical',  label: 'Critical Alerts',  desc: 'Abnormal biomarker values', iconBg: theme.danger  },
                  { key: 'reminders', label: 'Daily Reminders',  desc: 'Medication & activity',     iconBg: theme.warning },
                  { key: 'goals',     label: 'Goal Achievements',desc: 'When you hit your targets', iconBg: theme.success },
                  { key: 'reports',   label: 'Weekly Reports',   desc: 'Summary every Monday',      iconBg: '#8B5CF6'     },
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

          {/* THRESHOLDS */}
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

          {/* DASHBOARD CARDS */}
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
                      <Typography sx={{ flex: 1, fontSize: '0.88rem', fontWeight: 500, color: theme.textMain }}>{card.label}</Typography>
                      {visibleCards[card.key]
                        ? <Check size={18} color={theme.primary} />
                        : <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${theme.separator}` }} />}
                    </Box>
                    {i < arr.length - 1 && <Divider sx={{ borderColor: theme.separator }} />}
                  </Box>
                ))}
                <Typography sx={{ fontSize: '0.72rem', color: theme.textMuted, mt: 1.5 }}>
                  {Object.values(visibleCards).filter(Boolean).length} of {dashboardCards.length} cards visible
                </Typography>
              </Box>
            </AppleSection>
          )}

          {/* ABOUT */}
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

        </Box>
      </Box>
    </Box>

    <BottomNav />
  </Box>
);
}