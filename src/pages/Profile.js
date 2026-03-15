import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Typography, Paper, Button, Avatar,
  LinearProgress, Chip, TextField, InputAdornment,
  IconButton, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, CircularProgress, Snackbar, Alert
} from '@mui/material';
import {
  User, CalendarDays, ArrowUpNarrowWide,
  Droplet, Target, Flame, BedDouble,
  Droplets, KeyRound, Pencil, Activity, Bell,
  LayoutGrid, BarChart3, Settings, LogOut,
  ChevronRight, PersonStanding, Trophy, Shield,
  Smartphone, Download, Globe, Eye, EyeOff, Save, X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  updatePassword, reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'fairbase/storage';
import { getUserProfile, updateUserProfile } from '../services/firestoreService';
import { updateProfile } from 'firebase/auth';
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

// Те же цели что и в Onboarding
const GOALS = [
  { key: 'weightLoss',  label: 'Weight Loss',     emoji: '🏃', desc: 'Lose weight & burn fat'          },
  { key: 'health',      label: 'General Health',  emoji: '❤️', desc: 'Stay healthy & feel better'      },
  { key: 'sport',       label: 'Sport & Fitness', emoji: '💪', desc: 'Build strength & performance'    },
  { key: 'monitoring',  label: 'Health Monitor',  emoji: '📊', desc: 'Track vitals & manage condition' },
];

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

const defaultGoals = [
  { name: 'Steps',    current: 8234, target: 10000, unit: 'steps', icon: <PersonStanding />, color: theme.success, pct: 82 },
  { name: 'Calories', current: 1869, target: 2500,  unit: 'kcal',  icon: <Flame />,          color: theme.warning, pct: 75 },
  { name: 'Sleep',    current: 7.2,  target: 8,     unit: 'hrs',   icon: <BedDouble />,      color: theme.primary, pct: 90 },
  { name: 'Water',    current: 1.5,  target: 2.5,   unit: 'L',     icon: <Droplets />,       color: '#06B6D4',     pct: 60 },
];

const achievements = [
  { emoji: '🏆', name: 'Steps Master',     desc: '100,000 total steps',   earned: true  },
  { emoji: '⭐', name: 'Glucose Champion', desc: '±0.3 mmol stability',   earned: true  },
  { emoji: '🔥', name: 'Week Warrior',     desc: '7 days active streak',  earned: false },
  { emoji: '💧', name: 'Hydration Hero',   desc: 'Hit water goal 5 days', earned: false },
];

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const user     = auth.currentUser;

  const storage = getStorage();
const [avatarUrl,      setAvatarUrl]      = useState(user?.photoURL || null);
const [avatarUploading, setAvatarUploading] = useState(false);
const fileInputRef = useRef(null);

  const [loading,      setLoading]      = useState(true);
  const [editing,      setEditing]      = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [editingGoal,  setEditingGoal]  = useState(false);
  const [savingGoal,   setSavingGoal]   = useState(false);
  const [snackbar,     setSnackbar]     = useState({ open: false, msg: '', severity: 'success' });

  const [profile, setProfile] = useState({
    displayName: '', age: '', height: '', weight: '', bloodType: '', gender: '', goal: '',
  });
  const [editData,     setEditData]     = useState({ ...profile });
  const [selectedGoal, setSelectedGoal] = useState('');

  const [showPass, setShowPass] = useState(false);
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  // ── Загрузка из Firestore ──
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const data = await getUserProfile(user.uid);
      if (data) {
        const p = {
          displayName: data.displayName || user.email?.split('@')[0] || '',
          age:         data.age         || '',
          height:      data.height      || '',
          weight:      data.weight      || '',
          bloodType:   data.bloodType   || '',
          gender:      data.gender      || '',
          goal:        data.goal        || '',
        };
        setProfile(p);
        setEditData(p);
        setSelectedGoal(data.goal || '');
      }
      setLoading(false);
    };
    load();
  }, [user]);

  // ── Сохранение профиля ──
  const handleSaveProfile = async () => {
  setSaving(true);
  const ok = await updateUserProfile(user.uid, editData);
  if (ok) {
    // Обновляем displayName в Firebase Auth тоже
    if (editData.displayName) {
      await updateProfile(user, { displayName: editData.displayName });
    }
    setProfile({ ...editData });
    setEditing(false);
    showSnack('Profile saved successfully!', 'success');
  } else {
    showSnack('Failed to save. Try again.', 'error');
  }
  setSaving(false);
};

  // ── Сохранение цели ──
  const handleSaveGoal = async () => {
    setSavingGoal(true);
    const ok = await updateUserProfile(user.uid, { goal: selectedGoal });
    if (ok) {
      setProfile(p => ({ ...p, goal: selectedGoal }));
      setEditingGoal(false);
      showSnack('Goal updated!', 'success');
    } else {
      showSnack('Failed to update goal.', 'error');
    }
    setSavingGoal(false);
  };

  // ── Смена пароля ──
  const handlePasswordSave = async () => {
    if (password.new !== password.confirm) { showSnack('Passwords do not match!', 'error'); return; }
    if (password.new.length < 6)           { showSnack('Password must be at least 6 characters.', 'error'); return; }
    setPwSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, password.current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, password.new);
      setPassword({ current: '', new: '', confirm: '' });
      showSnack('Password updated successfully!', 'success');
    } catch (err) {
      showSnack(err.code === 'auth/wrong-password' ? 'Current password is incorrect.' : 'Failed to update password.', 'error');
    }
    setPwSaving(false);
  };

  const showSnack = (msg, severity = 'success') =>
    setSnackbar({ open: true, msg, severity });

  const handleAvatarChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setAvatarUploading(true);
  try {
    const storageRef = ref(storage, `avatars/${user.uid}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateProfile(user, { photoURL: url });
    setAvatarUrl(url);
    showSnack('Avatar updated!', 'success');
  } catch (err) {
    showSnack('Failed to upload avatar.', 'error');
  }
  setAvatarUploading(false);
};

  const personalDetails = [
    { label: 'Age',        value: profile.age       ? `${profile.age} years` : '—', icon: <CalendarDays size={18} />,      color: theme.primary },
    { label: 'Height',     value: profile.height    ? `${profile.height} cm` : '—', icon: <ArrowUpNarrowWide size={18} />, color: theme.warning },
    { label: 'Weight',     value: profile.weight    ? `${profile.weight} kg` : '—', icon: <User size={18} />,              color: theme.success },
    { label: 'Blood Type', value: profile.bloodType || '—',                          icon: <Droplet size={18} />,           color: theme.danger  },
    { label: 'Gender',     value: profile.gender    || '—',                          icon: <User size={18} />,              color: '#8B5CF6'     },
  ];

  const pwStrength      = password.new.length > 10 ? 'Strong' : password.new.length > 6 ? 'Medium' : password.new.length > 0 ? 'Weak' : '';
  const pwStrengthColor = pwStrength === 'Strong' ? theme.success : pwStrength === 'Medium' ? theme.warning : theme.danger;
  const pwStrengthWidth = pwStrength === 'Strong' ? '100%' : pwStrength === 'Medium' ? '60%' : pwStrength === 'Weak' ? '25%' : '0%';

  const currentGoalData = GOALS.find(g => g.key === profile.goal);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.bg }}>
      <Sidebar navigate={navigate} location={location} user={user} />

        {/* ✅ MobileHeader здесь */}
        <MobileHeader title="Profile" />

      <Box sx={{ flexGrow: 1, ml: { md: '250px' }, p: { xs: 2, md: 4 }, width: '100%' }}>

        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textMain, letterSpacing: '-0.5px' }}>
            My Profile
          </Typography>
          <Typography sx={{ color: theme.textSub, mt: 0.3 }}>
            Personal information and daily health targets
          </Typography>
        </Box>

        <Grid container spacing={3}>

          {/* ── ЛЕВАЯ КОЛОНКА ── */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Аватар */}
<Paper elevation={0} sx={{ p: 3, borderRadius: '24px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
  
  {/* скрытый input для файла */}
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    style={{ display: 'none' }}
    onChange={handleAvatarChange}
  />

  {/* Аватар с кнопкой редактирования */}
  <Box sx={{ position: 'relative', width: 80, height: 80, margin: '0 auto 16px' }}>
    <Avatar
      src={avatarUrl || undefined}
      sx={{
        width: 80, height: 80,
        bgcolor: '#DBEAFE', color: theme.primary,
        fontWeight: 800, fontSize: '1.8rem',
      }}>
      {!avatarUrl && ((profile.displayName || user?.email)?.[0]?.toUpperCase() || 'U')}
    </Avatar>

    {/* Кнопка редактирования поверх аватара */}
    <Box
      onClick={() => fileInputRef.current?.click()}
      sx={{
        position: 'absolute', bottom: 0, right: 0,
        width: 26, height: 26, borderRadius: '50%',
        bgcolor: theme.primary, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', border: '2px solid white',
        '&:hover': { bgcolor: '#1D4ED8' },
      }}>
      {avatarUploading
        ? <CircularProgress size={12} sx={{ color: 'white' }} />
        : <Pencil size={12} color="white" />
      }
    </Box>
  </Box>

  <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: theme.textMain }}>
    {profile.displayName || user?.email?.split('@')[0]}
  </Typography>
  <Typography sx={{ color: theme.textSub, fontSize: '0.85rem', mb: 1 }}>
    {user?.email}
  </Typography>
  {/* ... остальное без изменений */}

                {/* Текущая цель под именем */}
                {currentGoalData && (
                  <Chip
                    label={`${currentGoalData.emoji} ${currentGoalData.label}`}
                    size="small"
                    sx={{ bgcolor: theme.primaryBg, color: theme.primary, fontWeight: 700, mb: 2 }}
                  />
                )}
                {!currentGoalData && (
                  <Chip label="Patient Account" size="small"
                    sx={{ bgcolor: theme.successBg, color: theme.success, fontWeight: 700, mb: 2 }} />
                )}

                {!editing ? (
                  <Button fullWidth startIcon={<Pencil size={16} />}
                    onClick={() => setEditing(true)}
                    sx={{ bgcolor: theme.primary, color: 'white', borderRadius: '12px',
                      textTransform: 'none', fontWeight: 600, boxShadow: 'none',
                      '&:hover': { bgcolor: '#1D4ED8' } }}>
                    Edit Profile
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button fullWidth onClick={handleSaveProfile} disabled={saving}
                      startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <Save size={16} />}
                      sx={{ bgcolor: theme.success, color: 'white', borderRadius: '12px',
                        textTransform: 'none', fontWeight: 600, boxShadow: 'none',
                        '&:hover': { bgcolor: '#059669' } }}>
                      Save
                    </Button>
                    <Button fullWidth startIcon={<X size={16} />}
                      onClick={() => { setEditData({ ...profile }); setEditing(false); }}
                      sx={{ bgcolor: theme.bg, color: theme.textSub, borderRadius: '12px',
                        textTransform: 'none', fontWeight: 600, border: `1px solid ${theme.border}`,
                        '&:hover': { bgcolor: theme.border } }}>
                      Cancel
                    </Button>
                  </Box>
                )}
              </Paper>

              {/* Personal Details */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                <Typography sx={{ fontWeight: 700, color: theme.textMain, mb: 2,
                  display: 'flex', alignItems: 'center', gap: 1 }}>
                  <User size={16} color={theme.primary} /> Personal Details
                </Typography>

                {editing ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {[
                      { key: 'displayName', label: 'Full Name',   type: 'text'   },
                      { key: 'age',         label: 'Age',         type: 'number' },
                      { key: 'height',      label: 'Height (cm)', type: 'number' },
                      { key: 'weight',      label: 'Weight (kg)', type: 'number' },
                      { key: 'bloodType',   label: 'Blood Type',  type: 'text'   },
                    ].map(f => (
                      <TextField key={f.key} fullWidth size="small" label={f.label} type={f.type}
                        value={editData[f.key]}
                        onChange={e => {
                          // Для числовых — минимум 0
                          const val = f.type === 'number'
                            ? String(Math.max(0, +e.target.value))
                            : e.target.value;
                          setEditData(p => ({ ...p, [f.key]: val }));
                        }}
                        inputProps={f.type === 'number' ? { min: 0 } : {}}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                      />
                    ))}
                  </Box>
                ) : (
                  personalDetails.map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', p: 1.5, mb: 1, bgcolor: theme.bg, borderRadius: '12px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ bgcolor: `${item.color}18`, p: 0.8, borderRadius: '8px',
                          display: 'flex', color: item.color }}>
                          {item.icon}
                        </Box>
                        <Typography sx={{ fontSize: '0.85rem', color: theme.textSub, fontWeight: 500 }}>
                          {item.label}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: theme.textMain }}>
                        {item.value}
                      </Typography>
                    </Box>
                  ))
                )}
              </Paper>

              {/* 30-Day Summary */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                <Typography sx={{ fontWeight: 700, color: theme.textMain, mb: 2 }}>
                  30-Day Summary
                </Typography>
                {[
                  { label: 'Avg Heart Rate', value: '73 bpm',     color: theme.danger  },
                  { label: 'Avg Glucose',    value: '5.4 mmol/L', color: '#8B5CF6'     },
                  { label: 'Avg Sleep',      value: '7.1 hrs',    color: theme.primary },
                  { label: 'Avg Steps',      value: '8,120',      color: theme.success },
                ].map(s => (
                  <Box key={s.label} sx={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', py: 1, borderBottom: `1px solid ${theme.border}`,
                    '&:last-child': { borderBottom: 0 } }}>
                    <Typography sx={{ fontSize: '0.82rem', color: theme.textSub }}>{s.label}</Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: s.color }}>{s.value}</Typography>
                  </Box>
                ))}
              </Paper>

            </Box>
          </Grid>

          {/* ── ПРАВАЯ КОЛОНКА ── */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* ── Health Goal (из Firestore) ── */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontWeight: 700, color: theme.textMain,
                    display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Target size={16} color={theme.primary} /> Health Goal
                  </Typography>
                  {!editingGoal ? (
                    <Button size="small" startIcon={<Pencil size={14} />}
                      onClick={() => { setSelectedGoal(profile.goal); setEditingGoal(true); }}
                      sx={{ textTransform: 'none', fontWeight: 600, color: theme.primary,
                        fontSize: '0.82rem', borderRadius: '10px',
                        '&:hover': { bgcolor: theme.primaryBg } }}>
                      Change Goal
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" onClick={handleSaveGoal} disabled={savingGoal}
                        startIcon={savingGoal ? <CircularProgress size={12} color="inherit" /> : <Save size={14} />}
                        sx={{ textTransform: 'none', fontWeight: 700, color: 'white',
                          bgcolor: theme.success, borderRadius: '10px', px: 2,
                          '&:hover': { bgcolor: '#059669' } }}>
                        Save
                      </Button>
                      <Button size="small" onClick={() => setEditingGoal(false)}
                        sx={{ textTransform: 'none', fontWeight: 600, color: theme.textSub,
                          borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>

                {!editingGoal ? (
                  // Показываем текущую цель
                  currentGoalData ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2,
                      p: 2.5, borderRadius: '16px',
                      bgcolor: theme.primaryBg, border: `2px solid ${theme.primary}` }}>
                      <Typography sx={{ fontSize: '2.5rem' }}>{currentGoalData.emoji}</Typography>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: theme.primary }}>
                          {currentGoalData.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.82rem', color: theme.textSub }}>
                          {currentGoalData.desc}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: theme.bg,
                      border: `2px dashed ${theme.border}`, textAlign: 'center' }}>
                      <Typography sx={{ color: theme.textMuted, fontSize: '0.85rem' }}>
                        No goal set yet. Click "Change Goal" to set one.
                      </Typography>
                    </Box>
                  )
                ) : (
                  // Выбор новой цели
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    {GOALS.map(g => (
                      <Box key={g.key} onClick={() => setSelectedGoal(g.key)} sx={{
                        p: 2, borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s',
                        border: `2px solid ${selectedGoal === g.key ? theme.primary : theme.border}`,
                        bgcolor: selectedGoal === g.key ? theme.primaryBg : theme.white,
                        '&:hover': { borderColor: theme.primary, bgcolor: theme.primaryBg },
                      }}>
                        <Typography sx={{ fontSize: '1.4rem', mb: 0.5 }}>{g.emoji}</Typography>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700,
                          color: selectedGoal === g.key ? theme.primary : theme.textMain }}>
                          {g.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.74rem', color: theme.textSub, mt: 0.3 }}>
                          {g.desc}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>

              {/* Daily Goals прогресс */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                <Typography sx={{ fontWeight: 700, color: theme.textMain, mb: 3,
                  display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Target size={16} color={theme.primary} /> Daily Health Goals
                </Typography>
                <Grid container spacing={2}>
                  {defaultGoals.map((goal, i) => (
                    <Grid item xs={6} sm={3} key={i}>
                      <Box sx={{ p: 2, borderRadius: '18px', border: `1px solid ${theme.border}`,
                        textAlign: 'center', bgcolor: theme.white }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                          <Box sx={{ bgcolor: `${goal.color}15`, p: 1, borderRadius: '50%',
                            display: 'flex', color: goal.color }}>
                            {React.cloneElement(goal.icon, { size: 20 })}
                          </Box>
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', color: theme.textSub, fontWeight: 600 }}>
                          {goal.name}
                        </Typography>
                        <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: goal.color }}>
                          {goal.pct}%
                        </Typography>
                        <LinearProgress variant="determinate" value={goal.pct}
                          sx={{ height: 5, borderRadius: 3, bgcolor: theme.bg, my: 1,
                            '& .MuiLinearProgress-bar': { bgcolor: goal.color, borderRadius: 3 } }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: theme.textMain }}>
                          {goal.current}
                        </Typography>
                        <Typography sx={{ fontSize: '0.68rem', color: theme.textMuted }}>
                          / {goal.target} {goal.unit}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* Achievements */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                <Typography sx={{ fontWeight: 700, color: theme.textMain, mb: 2,
                  display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Trophy size={16} color={theme.warning} /> Achievements
                </Typography>
                <Grid container spacing={1.5}>
                  {achievements.map((a, i) => (
                    <Grid item xs={6} key={i}>
                      <Box sx={{ p: 2, borderRadius: '16px',
                        border: `1px solid ${a.earned ? theme.warning + '40' : theme.border}`,
                        bgcolor: a.earned ? '#FFFBEB' : theme.bg, opacity: a.earned ? 1 : 0.6,
                        display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ fontSize: '1.5rem' }}>{a.emoji}</Typography>
                        <Box>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: theme.textMain }}>
                            {a.name}
                          </Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: theme.textSub }}>
                            {a.desc}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* Change Password */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                <Typography sx={{ fontWeight: 700, color: theme.textMain, mb: 2,
                  display: 'flex', alignItems: 'center', gap: 1 }}>
                  <KeyRound size={16} color={theme.warning} /> Change Password
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { key: 'current', label: 'Current Password', showToggle: false },
                    { key: 'new',     label: 'New Password',     showToggle: true  },
                    { key: 'confirm', label: 'Confirm Password', showToggle: false },
                  ].map(field => (
                    <Grid item xs={12} sm={4} key={field.key}>
                      <TextField fullWidth size="small" label={field.label}
                        type={field.showToggle && showPass ? 'text' : 'password'}
                        value={password[field.key]}
                        onChange={e => setPassword(p => ({ ...p, [field.key]: e.target.value }))}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        InputProps={{
                          endAdornment: field.showToggle ? (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowPass(!showPass)}>
                                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                              </IconButton>
                            </InputAdornment>
                          ) : null,
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
                {password.new && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontSize: '0.75rem', color: theme.textSub }}>Password strength</Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: pwStrengthColor }}>{pwStrength}</Typography>
                    </Box>
                    <Box sx={{ height: 4, bgcolor: theme.bg, borderRadius: 2 }}>
                      <Box sx={{ height: '100%', borderRadius: 2, transition: 'width 0.3s',
                        width: pwStrengthWidth, bgcolor: pwStrengthColor }} />
                    </Box>
                  </Box>
                )}
                <Button onClick={handlePasswordSave} disabled={pwSaving}
                  startIcon={pwSaving ? <CircularProgress size={14} color="inherit" /> : null}
                  sx={{ mt: 2, borderRadius: '12px', textTransform: 'none', fontWeight: 700,
                    bgcolor: theme.primary, color: 'white', px: 3,
                    '&:hover': { bgcolor: '#1D4ED8' } }}>
                  {pwSaving ? 'Updating...' : 'Update Password'}
                </Button>
              </Paper>

              {/* Data & Privacy */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid ${theme.border}` }}>
                <Typography sx={{ fontWeight: 700, color: theme.textMain, mb: 2,
                  display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Shield size={16} color={theme.primary} /> Data & Privacy
                </Typography>
                {[
                  { icon: <Download size={18} />, label: 'Export My Data',  desc: 'Download all health records as CSV',    color: theme.primary },
                  { icon: <Globe size={18} />,    label: 'Privacy Policy',  desc: 'Read our GDPR-compliant privacy policy', color: '#8B5CF6'     },
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center',
                    p: 2, mb: 1.5, borderRadius: '14px', border: `1px solid ${theme.border}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                    '&:hover': { bgcolor: theme.bg, transform: 'translateX(4px)' },
                    '&:last-child': { mb: 0 } }}>
                    <Box sx={{ bgcolor: `${item.color}15`, p: 1.2, borderRadius: '10px',
                      display: 'flex', color: item.color, mr: 2, flexShrink: 0 }}>
                      {item.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: theme.textMain }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.76rem', color: theme.textSub }}>
                        {item.desc}
                      </Typography>
                    </Box>
                    <ChevronRight size={16} color={theme.textMuted} />
                  </Box>
                ))}
              </Paper>

            </Box>
          </Grid>
        </Grid>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: '12px', fontWeight: 600 }}>
          {snackbar.msg}
        </Alert>
      </Snackbar>
      
      {/* ✅ ДОБАВЛЕНО: нижняя навигация — видна только на телефоне */}
            <BottomNav />
    </Box>
  );
}