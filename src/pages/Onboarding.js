import React, { useState } from 'react';
import {
  Box, Typography, Button, TextField, Avatar,
  LinearProgress, MenuItem, Select, FormControl
} from '@mui/material';
import {
  User, ChevronRight, ChevronLeft, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { auth } from '../services/firebase';
import { updateUserProfile } from '../services/firestoreService';

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
  danger:    '#EF4444',
};

const GOALS = [
  { key: 'weightLoss', label: 'Weight Loss',    emoji: '🏃', desc: 'Lose weight & burn fat'          },
  { key: 'health',     label: 'General Health', emoji: '❤️', desc: 'Stay healthy & feel better'      },
  { key: 'sport',      label: 'Sport & Fitness',emoji: '💪', desc: 'Build strength & performance'    },
  { key: 'monitoring', label: 'Health Monitor', emoji: '📊', desc: 'Track vitals & manage condition' },
];

const BLOOD_TYPES = [
  { value: 'A+',  label: 'A+  (A Rh+)',  desc: 'Most common in Europe'  },
  { value: 'A−',  label: 'A−  (A Rh−)',  desc: 'Rare universal donor'   },
  { value: 'B+',  label: 'B+  (B Rh+)',  desc: 'Common in Asia'         },
  { value: 'B−',  label: 'B−  (B Rh−)',  desc: 'Very rare'              },
  { value: 'AB+', label: 'AB+ (AB Rh+)', desc: 'Universal recipient'    },
  { value: 'AB−', label: 'AB− (AB Rh−)', desc: 'Rarest blood type'      },
  { value: 'O+',  label: 'O+  (O Rh+)',  desc: 'Most common worldwide'  },
  { value: 'O−',  label: 'O−  (O Rh−)',  desc: 'Universal donor'        },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const user     = auth.currentUser;

  const [step,   setStep]   = useState(1);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    displayName: user?.displayName || user?.email?.split('@')[0] || '',
    gender:      '',
    age:         '',
    height:      '',
    weight:      '',
    bloodType:   '',
    goal:        '',
  });

  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.displayName.trim())          e.displayName = 'Name is required';
    if (!form.gender)                      e.gender      = 'Please select gender';
    if (!form.age    || +form.age    <= 0) e.age         = 'Enter valid age';
    if (+form.age    > 120)                e.age         = 'Age must be under 120';
    if (!form.height || +form.height <= 0) e.height      = 'Enter valid height';
    if (+form.height > 300)                e.height      = 'Height must be under 300 cm';
    if (!form.weight || +form.weight <= 0) e.weight      = 'Enter valid weight';
    if (+form.weight > 500)                e.weight      = 'Weight must be under 500 kg';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleFinish = async () => {
    setSaving(true);
    await updateUserProfile(user.uid, {
      displayName:    form.displayName,
      gender:         form.gender,
      age:            +form.age,
      height:         +form.height,
      weight:         +form.weight,
      bloodType:      form.bloodType || null,
      goal:           form.goal      || null,
      onboardingDone: true,
    });
    if (form.displayName) {
      await updateProfile(user, { displayName: form.displayName });
    }
    setSaving(false);
    navigate('/dashboard');
  };

  return (
    <Box sx={{
      minHeight: '100vh', bgcolor: theme.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2,
    }}>
      <Box sx={{ width: '100%', maxWidth: 560 }}>

        {/* Логотип */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5,
            bgcolor: theme.white, px: 3, py: 1.5, borderRadius: '20px',
            border: `1px solid ${theme.border}`,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Box sx={{ bgcolor: theme.primary, p: 0.8, borderRadius: '10px', display: 'flex' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </Box>
            <Typography sx={{ fontWeight: 800, color: theme.textMain, fontSize: '1.1rem' }}>
              BioSense
            </Typography>
          </Box>
        </Box>

        {/* Прогресс */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: theme.textSub }}>
              Step {step} of 2
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: theme.primary }}>
              {step === 1 ? '50%' : '100%'}
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={step === 1 ? 50 : 100}
            sx={{ height: 6, borderRadius: 3, bgcolor: theme.border,
              '& .MuiLinearProgress-bar': { bgcolor: theme.primary, borderRadius: 3 } }} />
        </Box>

        {/* Карточка */}
        <Box sx={{
          bgcolor: theme.white, borderRadius: '28px',
          border: `1px solid ${theme.border}`,
          boxShadow: '0 4px 32px rgba(0,0,0,0.06)',
          p: { xs: 3, sm: 4 },
        }}>

          {/* ══ ШАГ 1 ══ */}
          {step === 1 && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: theme.textMain, mb: 0.5 }}>
                  👋 Tell us about yourself
                </Typography>
                <Typography sx={{ color: theme.textSub, fontSize: '0.9rem' }}>
                  This helps us personalise your health experience
                </Typography>
              </Box>

              {/* Avatar */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Avatar sx={{ width: 72, height: 72, bgcolor: '#DBEAFE',
                  color: theme.primary, fontWeight: 800, fontSize: '1.8rem' }}>
                  {form.displayName?.[0]?.toUpperCase() || '?'}
                </Avatar>
              </Box>

              {/* Full Name */}
              <TextField fullWidth label="Full Name" value={form.displayName}
                onChange={e => set('displayName', e.target.value)}
                error={!!errors.displayName} helperText={errors.displayName}
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
                InputProps={{
                  startAdornment: <User size={16} color={theme.textMuted} style={{ marginRight: 8 }} />,
                }}
              />

              {/* Gender */}
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: theme.textSub, mb: 1 }}>
                  Gender
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {['Male', 'Female'].map(g => (
                    <Box key={g} onClick={() => set('gender', g)} sx={{
                      flex: 1, p: 2, borderRadius: '14px', textAlign: 'center',
                      border: `2px solid ${form.gender === g ? theme.primary : theme.border}`,
                      bgcolor: form.gender === g ? theme.primaryBg : theme.white,
                      cursor: 'pointer', transition: 'all 0.2s',
                      '&:hover': { borderColor: theme.primary },
                    }}>
                      <Typography sx={{ fontSize: '1.4rem', mb: 0.5 }}>
                        {g === 'Male' ? '👨' : '👩'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700,
                        color: form.gender === g ? theme.primary : theme.textMain }}>
                        {g}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                {errors.gender && (
                  <Typography sx={{ fontSize: '0.75rem', color: theme.danger, mt: 0.5, ml: 1 }}>
                    {errors.gender}
                  </Typography>
                )}
              </Box>

              {/* Age / Height / Weight */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5 }}>
                {[
                  { key: 'age',    label: 'Age',    unit: 'yrs' },
                  { key: 'height', label: 'Height', unit: 'cm'  },
                  { key: 'weight', label: 'Weight', unit: 'kg'  },
                ].map(f => (
                  <TextField key={f.key} fullWidth label={f.label} type="number"
                    value={form[f.key]}
                    onChange={e => set(f.key, Math.max(0, +e.target.value) || '')}
                    inputProps={{ min: 0 }}
                    error={!!errors[f.key]}
                    helperText={errors[f.key] || f.unit}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* ══ ШАГ 2 ══ */}
          {step === 2 && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: theme.textMain, mb: 0.5 }}>
                  🎯 Your health goals
                </Typography>
                <Typography sx={{ color: theme.textSub, fontSize: '0.9rem' }}>
                  Optional — you can change these later in Profile
                </Typography>
              </Box>

              {/* Goals */}
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: theme.textSub, mb: 1.5 }}>
                  Primary Goal{' '}
                  <Typography component="span" sx={{ color: theme.textMuted, fontWeight: 400 }}>
                    (optional)
                  </Typography>
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  {GOALS.map(g => (
                    <Box key={g.key}
                      onClick={() => set('goal', form.goal === g.key ? '' : g.key)}
                      sx={{
                        p: 2, borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s',
                        border: `2px solid ${form.goal === g.key ? theme.primary : theme.border}`,
                        bgcolor: form.goal === g.key ? theme.primaryBg : theme.white,
                        '&:hover': { borderColor: theme.primary, bgcolor: theme.primaryBg },
                      }}>
                      <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>{g.emoji}</Typography>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700,
                        color: form.goal === g.key ? theme.primary : theme.textMain }}>
                        {g.label}
                      </Typography>
                      <Typography sx={{ fontSize: '0.74rem', color: theme.textSub, mt: 0.3 }}>
                        {g.desc}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Blood Type */}
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: theme.textSub, mb: 1.5 }}>
                  🩸 Blood Type{' '}
                  <Typography component="span" sx={{ color: theme.textMuted, fontWeight: 400 }}>
                    (optional)
                  </Typography>
                </Typography>

                <FormControl fullWidth>
                  <Select
                    value={form.bloodType}
                    onChange={e => set('bloodType', e.target.value)}
                    displayEmpty
                    sx={{
                      borderRadius: '14px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.border },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.primary },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.primary },
                    }}
                  >
                    <MenuItem value="" disabled>
                      <Typography sx={{ color: theme.textMuted }}>Select your blood type...</Typography>
                    </MenuItem>
                    {BLOOD_TYPES.map(bt => (
                      <MenuItem key={bt.value} value={bt.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}>
                          <Box sx={{
                            width: 36, height: 36, borderRadius: '10px',
                            bgcolor: form.bloodType === bt.value ? '#FEF2F2' : theme.bg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: theme.danger }}>
                              {bt.value}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: theme.textMain }}>
                              {bt.label}
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: theme.textSub }}>
                              {bt.desc}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Подтверждение выбора */}
                {form.bloodType && (
                  <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1,
                    p: 1.5, bgcolor: '#FEF2F2', borderRadius: '12px',
                    border: `1px solid ${theme.danger}30` }}>
                    <Typography sx={{ fontSize: '1.2rem' }}>🩸</Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: theme.danger }}>
                      Blood Type {form.bloodType} selected
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Кнопки навигации */}
          <Box sx={{ display: 'flex', gap: 1.5, mt: 4 }}>
            {step === 2 && (
              <Button fullWidth onClick={() => setStep(1)}
                startIcon={<ChevronLeft size={18} />}
                sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 700,
                  color: theme.textSub, border: `1px solid ${theme.border}`,
                  bgcolor: theme.white, py: 1.5,
                  '&:hover': { bgcolor: theme.bg } }}>
                Back
              </Button>
            )}

            {step === 1 ? (
              <Button fullWidth onClick={handleNext}
                endIcon={<ChevronRight size={18} />}
                sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 700,
                  bgcolor: theme.primary, color: 'white', py: 1.5,
                  '&:hover': { bgcolor: '#1D4ED8' } }}>
                Continue
              </Button>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                <Button fullWidth onClick={handleFinish} disabled={saving}
                  endIcon={saving ? null : <Check size={18} />}
                  sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 700,
                    bgcolor: theme.success, color: 'white', py: 1.5,
                    '&:hover': { bgcolor: '#059669' } }}>
                  {saving ? 'Saving...' : 'Get Started!'}
                </Button>
                <Button fullWidth onClick={handleFinish}
                  sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 600,
                    color: theme.textMuted, py: 1,
                    '&:hover': { color: theme.textSub } }}>
                  Skip for now
                </Button>
              </Box>
            )}
          </Box>

        </Box>
      </Box>
    </Box>
  );
}