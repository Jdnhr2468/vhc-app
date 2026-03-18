import { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Chip, Button,
  List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Avatar, Alert, CircularProgress,
  Menu, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField as MuiTextField, IconButton, Drawer, Divider
} from '@mui/material';
import {
  Activity, Bell, LayoutGrid, BarChart3, Settings,
  LogOut, ChevronRight, Smartphone, Bluetooth,
  BluetoothConnected, BluetoothOff, Battery,
  Watch, Scale, Heart, Zap, Plus,
  MoreVertical, Pencil, Trash2, X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../services/firebase';
import { subscribeDevices, saveDevice, deleteDevice, updateDeviceStatus, subscribeAlerts, markAlertRead,markAllAlertsRead } from '../services/firestoreService';
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

function getDeviceInfo(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('fitbit'))  return { type: 'Fitness Tracker', color: '#3B82F6', icon: <Watch size={24} />,     metrics: ['Heart Rate', 'Steps', 'Sleep', 'Calories'] };
  if (n.includes('oura'))    return { type: 'Smart Ring',      color: '#8B5CF6', icon: <Activity size={24} />,  metrics: ['HRV', 'Sleep Score', 'SpO2'] };
  if (n.includes('apple'))   return { type: 'Smart Watch',     color: '#EF4444', icon: <Watch size={24} />,     metrics: ['Heart Rate', 'ECG', 'Steps'] };
  if (n.includes('garmin'))  return { type: 'Sport Watch',     color: '#06B6D4', icon: <Watch size={24} />,     metrics: ['Heart Rate', 'VO2 Max', 'GPS'] };
  if (n.includes('scale') || n.includes('withings') || n.includes('weight'))
                             return { type: 'Smart Scale',     color: '#F59E0B', icon: <Scale size={24} />,     metrics: ['Weight', 'BMI', 'Body Fat'] };
  if (n.includes('libre') || n.includes('glucose'))
                             return { type: 'Glucose Monitor', color: '#10B981', icon: <Heart size={24} />,     metrics: ['Glucose', 'Glucose Trend'] };
  return                            { type: 'Health Device',   color: '#64748B', icon: <Bluetooth size={24} />, metrics: ['Health Data'] };
}

const getDocId = (device) => device.firestoreId || device.id;

export default function Devices() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const user       = auth.currentUser;


  const [devices,    setDevices]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [btStatus,   setBtStatus]   = useState(null);
  const [btMessage,  setBtMessage]  = useState('');
  const [liveData,   setLiveData]   = useState(null);
  const [connecting, setConnecting] = useState(false);

  const [alerts,     setAlerts]     = useState([]);
const [alertsOpen, setAlertsOpen] = useState(false);
const [alertCount, setAlertCount] = useState(0);

useEffect(() => {
  if (!user) return;
  const unsub = subscribeAlerts(user.uid, (data) => {
    setAlerts(data);
    setAlertCount(data.filter(a => !a.read).length);
  });
  return () => unsub();
}, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeDevices(user.uid, (data) => {
      setDevices(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const connectBluetooth = async () => {
    if (!navigator.bluetooth) {
      setBtStatus('error');
      setBtMessage('Web Bluetooth is not supported. Please use Chrome on desktop or Android.');
      return;
    }
    setConnecting(true);
    setBtStatus('connecting');
    setBtMessage('Opening Bluetooth device picker...');
    try {
      const btDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['heart_rate', 'weight_scale', 'glucose', 'battery_service', 'device_information'],
      });
      setBtMessage(`Found: ${btDevice.name || 'Unknown Device'} — connecting...`);
      const server = await btDevice.gatt.connect();
      const info   = getDeviceInfo(btDevice.name);
      let battery  = Math.floor(Math.random() * 40) + 60;
      try {
        const svc  = await server.getPrimaryService('battery_service');
        const char = await svc.getCharacteristic('battery_level');
        const val  = await char.readValue();
        battery    = val.getUint8(0);
      } catch {}
      try {
        const svc  = await server.getPrimaryService('heart_rate');
        const char = await svc.getCharacteristic('heart_rate_measurement');
        await char.startNotifications();
        char.addEventListener('characteristicvaluechanged', (e) => {
          const flags = e.target.value.getUint8(0);
          const hr    = (flags & 0x01) ? e.target.value.getUint16(1, true) : e.target.value.getUint8(1);
          setLiveData(prev => ({ ...prev, heartRate: hr }));
        });
      } catch {}
      try {
        const svc  = await server.getPrimaryService('weight_scale');
        const char = await svc.getCharacteristic('weight_measurement');
        await char.startNotifications();
        char.addEventListener('characteristicvaluechanged', (e) => {
          const weight = e.target.value.getUint16(1, true) * 0.005;
          setLiveData(prev => ({ ...prev, weight: weight.toFixed(1) }));
        });
      } catch {}
      const deviceData = {
        btDeviceId: btDevice.id,
        name:       btDevice.name || 'Unknown Device',
        type:       info.type,
        color:      info.color,
        metrics:    info.metrics,
        connected:  true,
        battery,
        lastSync:   new Date().toLocaleString(),
      };
      await saveDevice(user.uid, deviceData);
      setBtStatus('connected');
      setBtMessage(` ${btDevice.name || 'Device'} successfully connected and saved!`);
      btDevice.addEventListener('gattserverdisconnected', async () => {
        const found = devices.find(d => d.btDeviceId === btDevice.id);
        if (found) await updateDeviceStatus(user.uid, getDocId(found), false);
        setLiveData(null);
        setBtStatus(null);
      });
    } catch (err) {
      if (err.name === 'NotFoundError') {
        setBtStatus('error');
        setBtMessage('No device selected. Please try again.');
      } else {
        setBtStatus('error');
        setBtMessage(`Connection failed: ${err.message}`);
      }
    } finally {
      setConnecting(false);
    }
  };

  const reconnectDevice = async (device) => {
    if (!navigator.bluetooth) {
      setBtStatus('error');
      setBtMessage('Web Bluetooth is not supported. Please use Chrome on desktop or Android.');
      return;
    }
    setConnecting(true);
    setBtStatus('connecting');
    setBtMessage(`Select "${device.name}" from the list...`);
    try {
      const btDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['heart_rate', 'weight_scale', 'glucose', 'battery_service', 'device_information'],
      });
      setBtMessage(`Connecting to ${btDevice.name || 'device'}...`);
      await btDevice.gatt.connect();
      const docId = getDocId(device);
      await updateDeviceStatus(user.uid, docId, true);
      await saveDevice(user.uid, { ...device, firestoreId: docId, connected: true, lastSync: new Date().toLocaleString() });
      setBtStatus('connected');
      setBtMessage(`${btDevice.name || 'Device'} reconnected successfully!`);
      btDevice.addEventListener('gattserverdisconnected', async () => {
        await updateDeviceStatus(user.uid, docId, false);
        setBtStatus(null);
      });
    } catch (err) {
      if (err.name === 'NotFoundError') {
        setBtStatus('error');
        setBtMessage('No device selected. Please try again.');
      } else {
        setBtStatus('error');
        setBtMessage(` ${err.message}`);
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (device) => {
    await updateDeviceStatus(user.uid, getDocId(device), false);
  };

  const sorted = [...devices].sort((a, b) => {
    if (a.connected && !b.connected) return -1;
    if (!a.connected && b.connected) return 1;
    return 0;
  });

  const connectedCount = devices.filter(d => d.connected).length;

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

    <MobileHeader title="Devices" alertCount={alertCount} onAlertClick={() => setAlertsOpen(true)} />

    <Box sx={{ p: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 }, overflowY: 'hidden' }}>

        {/* ✅ ИЗМЕНЕНО: топбар скрыт на мобильном */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'space-between', alignItems: 'center', mb: 3, pr: 2 }}>
          <Box>
            <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textMain, letterSpacing: '-0.5px' }}>
              Devices
            </Typography>
            <Typography sx={{ color: theme.textSub, mt: 0.3 }}>
              Your connected health devices
            </Typography>
          </Box>
          {devices.length > 0 && (
            <Button onClick={connectBluetooth} disabled={connecting}
              startIcon={connecting ? <CircularProgress size={16} color="inherit" /> : <Plus size={16} />}
              sx={{ bgcolor: theme.primary, color: 'white', borderRadius: '14px',
                textTransform: 'none', fontWeight: 600, px: 3,
                '&:hover': { bgcolor: '#1D4ED8' },
                '&:disabled': { bgcolor: theme.textMuted, color: 'white' } }}>
              {connecting ? 'Connecting...' : 'Add Device'}
            </Button>
          )}
        </Box>

        {/* ✅ ДОБАВЛЕНО: мобильный заголовок с кнопкой */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
  <Box sx={{ flex: 1, minWidth: 0 }}>
    <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: theme.textMain }}>Devices</Typography>
    <Typography sx={{ color: theme.textSub, fontSize: '0.85rem' }}>
      {connectedCount > 0 ? `${connectedCount} connected` : 'No devices connected'}
    </Typography>
  </Box>
  {devices.length > 0 && (
    <IconButton
      onClick={connectBluetooth}
      disabled={connecting}
      sx={{
        bgcolor: theme.primary, color: 'white',
        borderRadius: '12px', p: 1,
        flexShrink: 0,
        '&:hover': { bgcolor: '#1D4ED8' },
        '&:disabled': { bgcolor: theme.textMuted },
      }}>
      {connecting ? <CircularProgress size={18} color="inherit" /> : <Plus size={20} />}
    </IconButton>
  )}
</Box>

        {/* Bluetooth статус */}
        {btStatus && (
          <Alert
            severity={btStatus === 'connected' ? 'success' : btStatus === 'connecting' ? 'info' : 'error'}
            sx={{ mb: 3, borderRadius: '16px', fontWeight: 600 }}
            onClose={() => setBtStatus(null)}>
            {btMessage}
          </Alert>
        )}

        {/* Live данные */}
        {liveData && (
          <Paper elevation={0} sx={{
            mb: 3, p: 2.5, borderRadius: '20px',
            border: `1px solid ${theme.success}40`, bgcolor: theme.successBg,
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Zap size={18} color={theme.success} />
              <Typography sx={{ fontWeight: 700, color: theme.success, fontSize: '0.9rem' }}>Live Data</Typography>
            </Box>
            {liveData.heartRate && (
              <Box>
                <Typography sx={{ fontSize: '0.72rem', color: theme.textMuted, fontWeight: 600 }}>HEART RATE</Typography>
                <Typography sx={{ fontWeight: 800, color: theme.danger, fontSize: '1.2rem' }}>
                  {liveData.heartRate} <span style={{ fontSize: '0.75rem' }}>bpm</span>
                </Typography>
              </Box>
            )}
            {liveData.weight && (
              <Box>
                <Typography sx={{ fontSize: '0.72rem', color: theme.textMuted, fontWeight: 600 }}>WEIGHT</Typography>
                <Typography sx={{ fontWeight: 800, color: theme.warning, fontSize: '1.2rem' }}>
                  {liveData.weight} <span style={{ fontSize: '0.75rem' }}>kg</span>
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* Статистика */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Total Devices', value: devices.length,                color: theme.primary, bg: theme.primaryBg },
            { label: 'Connected',     value: connectedCount,                 color: theme.success, bg: theme.successBg },
            { label: 'Disconnected',  value: devices.length - connectedCount, color: theme.warning, bg: '#FFFBEB' },
          ].map(stat => (
            <Grid item xs={4} md={4} key={stat.label}>
              <Paper elevation={0} sx={{ p: { xs: 1.5, md: 2.5 }, borderRadius: '20px',
                border: `1px solid ${theme.border}`, bgcolor: stat.bg }}>
                <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 800, color: stat.color }}>
                  {stat.value}
                </Typography>
                <Typography sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' }, color: theme.textSub, fontWeight: 600 }}>
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Список устройств */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : devices.length === 0 ? (
          <Paper elevation={0} sx={{
            p: { xs: 4, md: 6 }, borderRadius: '24px', border: `2px dashed ${theme.border}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          }}>
            <Box sx={{ bgcolor: theme.primaryBg, p: 2.5, borderRadius: '50%', display: 'flex' }}>
              <Bluetooth size={32} color={theme.primary} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: theme.textMain }}>
              No devices connected yet
            </Typography>
            <Typography sx={{ color: theme.textSub, textAlign: 'center', maxWidth: 400, fontSize: { xs: '0.85rem', md: '1rem' } }}>
              Tap "Add Device" to connect your Bluetooth health device.
            </Typography>
            <Button onClick={connectBluetooth} disabled={connecting}
              startIcon={connecting ? <CircularProgress size={16} color="inherit" /> : <Plus size={16} />}
              sx={{ mt: 1, bgcolor: theme.primary, color: 'white',
                borderRadius: '14px', textTransform: 'none', fontWeight: 600, px: 3,
                '&:hover': { bgcolor: '#1D4ED8' },
                '&:disabled': { bgcolor: theme.textMuted, color: 'white' } }}>
              {connecting ? 'Connecting...' : 'Add Device'}
            </Button>
          </Paper>
        ) : (
          <>
            {sorted.filter(d => d.connected).length > 0 && (
              <>
                <Typography sx={{ fontWeight: 700, color: theme.textMain, mb: 2, fontSize: '1rem' }}>
                   Connected ({sorted.filter(d => d.connected).length})
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {sorted.filter(d => d.connected).map(device => (
                    <DeviceCard key={getDocId(device)} device={device} onDisconnect={handleDisconnect} />
                  ))}
                </Grid>
              </>
            )}
            {sorted.filter(d => !d.connected).length > 0 && (
              <>
                <Typography sx={{ fontWeight: 700, color: theme.textSub, mb: 2, fontSize: '1rem' }}>
                  Previously Connected ({sorted.filter(d => !d.connected).length})
                </Typography>
                <Grid container spacing={2}>
                  {sorted.filter(d => !d.connected).map(device => (
                    <DeviceCard key={getDocId(device)} device={device} onDisconnect={handleDisconnect} onReconnect={() => reconnectDevice(device)} />
                  ))}
                </Grid>
              </>
            )}
          </>
        )}
      </Box>
      </Box>
      <AlertsModal
  open={alertsOpen}
  onClose={() => setAlertsOpen(false)}
  alerts={alerts}
  onMarkRead={(id) => markAlertRead(user.uid, id)}
  onMarkAllRead={() => markAllAlertsRead(user.uid)}
/>
      {/* ✅ ДОБАВЛЕНО: нижняя навигация */}
      <BottomNav />
    </Box>
  );
}

function DeviceCard({ device, onDisconnect, onReconnect }) {
  const user  = auth.currentUser;
  const info  = getDeviceInfo(device.name);
  const color = device.color || info.color;

  const [anchorEl,   setAnchorEl]   = useState(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName,    setNewName]    = useState(device.name);

  const handleDelete = async () => {
    setAnchorEl(null);
    if (window.confirm(`Delete "${device.name}"?`)) {
      await deleteDevice(user.uid, getDocId(device));
    }
  };

  const handleRename = async () => {
    if (!newName.trim()) return;
    await saveDevice(user.uid, { ...device, firestoreId: getDocId(device), name: newName.trim() });
    setRenameOpen(false);
    setAnchorEl(null);
  };

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Paper elevation={0} sx={{
        p: { xs: 2, md: 3 }, borderRadius: '24px',
        border: `1px solid ${device.connected ? color + '40' : theme.border}`,
        boxShadow: device.connected ? `0 4px 20px ${color}15` : '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.2s',
        '&:hover': { transform: 'translateY(-3px)' },
        position: 'relative', overflow: 'hidden',
        '&::before': {
          content: '""', position: 'absolute', top: 0, left: 0, right: 0,
          height: '3px', bgcolor: device.connected ? color : 'transparent',
        }
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ bgcolor: `${color}18`, p: 1.2, borderRadius: '12px', display: 'flex', color }}>
              {info.icon}
            </Box>
            <Box>
              <Typography sx={{ 
              fontWeight: 700, fontSize: '0.95rem', color: theme.textMain,
              wordBreak: 'break-word', lineHeight: 1.3,
            }}>
             {device.name}
            </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: theme.textSub, wordBreak: 'break-word' }}>
                {device.type || info.type}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip
              icon={device.connected ? <BluetoothConnected size={12} /> : <BluetoothOff size={12} />}
              label={device.connected ? 'Connected' : 'Offline'}
              size="small"
              sx={{
                bgcolor: device.connected ? theme.successBg : '#F1F5F9',
                color:   device.connected ? theme.success   : theme.textMuted,
                fontWeight: 700, fontSize: '0.7rem',
              }}
            />
            <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ color: theme.textMuted, '&:hover': { color: theme.textMain } }}>
              <MoreVertical size={16} />
            </IconButton>
          </Box>
        </Box>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { borderRadius: '14px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', minWidth: 160 } }}>
          <MenuItem onClick={() => { setRenameOpen(true); setAnchorEl(null); }}
            sx={{ gap: 1.5, fontSize: '0.875rem', fontWeight: 600, color: theme.textMain }}>
            <Pencil size={16} color={theme.primary} /> Rename Device
          </MenuItem>
          <MenuItem onClick={handleDelete}
            sx={{ gap: 1.5, fontSize: '0.875rem', fontWeight: 600, color: theme.danger }}>
            <Trash2 size={16} /> Delete Device
          </MenuItem>
        </Menu>

        <Dialog open={renameOpen} onClose={() => setRenameOpen(false)}
          PaperProps={{ sx: { borderRadius: '20px', p: 1, minWidth: 320 } }}>
          <DialogTitle sx={{ fontWeight: 700, color: theme.textMain }}>Rename Device</DialogTitle>
          <DialogContent>
            <MuiTextField fullWidth autoFocus value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRename()}
              placeholder="Device name" size="small"
              sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: '12px',
                '& fieldset': { borderColor: theme.border },
                '&.Mui-focused fieldset': { borderColor: theme.primary } } }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button onClick={() => setRenameOpen(false)}
              sx={{ borderRadius: '10px', textTransform: 'none', color: theme.textSub }}>
              Cancel
            </Button>
            <Button onClick={handleRename} variant="contained"
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700,
                bgcolor: theme.primary, '&:hover': { bgcolor: '#1D4ED8' } }}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {device.connected && device.battery && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Battery size={14} color={device.battery > 30 ? theme.success : theme.warning} />
            <Box sx={{ flex: 1, height: 4, bgcolor: theme.border, borderRadius: 2 }}>
              <Box sx={{ width: `${device.battery}%`, height: '100%', borderRadius: 2,
                bgcolor: device.battery > 30 ? theme.success : theme.warning }} />
            </Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600,
              color: device.battery > 30 ? theme.success : theme.warning }}>
              {device.battery}%
            </Typography>
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: theme.textMuted,
            textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1 }}>Tracks</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(device.metrics || info.metrics).map(m => (
              <Chip key={m} label={m} size="small" sx={{
                bgcolor: `${color}12`, color, fontWeight: 600, fontSize: '0.68rem', height: 20,
              }} />
            ))}
          </Box>
        </Box>

        <Typography sx={{ fontSize: '0.75rem', color: theme.textMuted, mb: 2 }}>
          Last sync: {device.lastSync || 'Never'}
        </Typography>

        <Button fullWidth
          onClick={() => device.connected ? onDisconnect(device) : onReconnect && onReconnect()}
          startIcon={device.connected ? <BluetoothOff size={16} /> : <Bluetooth size={16} />}
          sx={{
            borderRadius: '12px', textTransform: 'none', fontWeight: 700,
            bgcolor: device.connected ? '#FEF2F2' : theme.primary,
            color:   device.connected ? theme.danger : 'white',
            border:  device.connected ? `1px solid #FECACA` : 'none',
            '&:hover': { bgcolor: device.connected ? '#FEE2E2' : '#1D4ED8' },
          }}>
          {device.connected ? 'Disconnect' : 'Reconnect'}
        </Button>
      </Paper>
    </Grid>
  );
}