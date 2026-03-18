import { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Button, Avatar,
  Chip, CircularProgress, Tab, Tabs,
} from '@mui/material';
import {
  Users, TicketCheck,
  CheckCircle, Clock, AlertTriangle, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
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

export default function Admin() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const ticketsSnap = await getDocs(
          query(collection(db, 'supportTickets'), orderBy('createdAt', 'desc'))
        );
        setTickets(ticketsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleCloseTicket = async (ticketId) => {
    await updateDoc(doc(db, 'supportTickets', ticketId), { status: 'closed' });
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'closed' } : t));
  };

  const stats = {
    totalUsers:    users.length,
    totalTickets:  tickets.length,
    openTickets:   tickets.filter(t => t.status === 'open').length,
    closedTickets: tickets.filter(t => t.status === 'closed').length,
  };

  const regularUsers = users.filter(u => u.role !== 'admin');
  const adminUsers   = users.filter(u => u.role === 'admin');

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  );

  const UserCard = ({ u, isAdmin }) => (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 2,
      p: 2, mb: 1.5, borderRadius: '14px',
      border: `1px solid ${isAdmin ? '#FEF3C7' : theme.border}`,
      bgcolor: isAdmin ? '#FFFBEB' : theme.bg,
    }}>
      <Avatar sx={{
        bgcolor: isAdmin ? '#FEF3C7' : theme.primaryBg,
        color:   isAdmin ? '#D97706' : theme.primary,
        fontWeight: 700,
      }}>
        {(u.displayName || u.email)?.[0]?.toUpperCase() || 'U'}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: theme.textMain }}>
          {u.displayName || u.email?.split('@')[0] || 'Unknown'}
        </Typography>
        <Typography sx={{ fontSize: '0.78rem', color: theme.textSub }}>
          {u.email}
        </Typography>
      </Box>
      <Chip
        label={u.role || 'patient'}
        size="small"
        sx={{
          bgcolor: isAdmin ? '#FEF3C7' : theme.successBg,
          color:   isAdmin ? '#D97706' : theme.success,
          fontWeight: 700, fontSize: '0.72rem',
        }}
      />
      <Typography sx={{ fontSize: '0.72rem', color: theme.textMuted }}>
        {u.createdAt?.toDate?.()?.toLocaleDateString() || '—'}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.bg }}>

      {/* Header */}
      <Box sx={{
        bgcolor: theme.white, borderBottom: `1px solid ${theme.border}`,
        px: 4, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BioSenseLogo variant="sidebar" />
          <Chip label="Admin Panel" size="small"
            sx={{ bgcolor: '#FEF3C7', color: '#D97706', fontWeight: 700, fontSize: '0.72rem' }} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ fontSize: '0.85rem', color: theme.textSub }}>
            {user?.email}
          </Typography>
          <Button onClick={() => { auth.signOut(); navigate('/login'); }}
            startIcon={<LogOut size={16} />}
            sx={{ textTransform: 'none', color: theme.danger, fontWeight: 600,
              '&:hover': { bgcolor: '#FEF2F2' } }}>
            Logout
          </Button>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2, md: 4 } }}>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Total Users',    value: regularUsers.length,  icon: <Users size={24} />,         color: theme.primary, bg: theme.primaryBg },
            { label: 'Total Tickets',  value: stats.totalTickets,   icon: <TicketCheck size={24} />,   color: '#8B5CF6',     bg: '#F5F3FF'       },
            { label: 'Open Tickets',   value: stats.openTickets,    icon: <AlertTriangle size={24} />, color: theme.warning, bg: '#FFFBEB'       },
            { label: 'Closed Tickets', value: stats.closedTickets,  icon: <CheckCircle size={24} />,   color: theme.success, bg: theme.successBg },
          ].map(stat => (
            <Grid item xs={6} md={3} key={stat.label}>
              <Paper elevation={0} sx={{
                p: 3, borderRadius: '20px', border: `1px solid ${theme.border}`,
                bgcolor: stat.bg,
              }}>
                <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
                <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: stat.color }}>
                  {stat.value}
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: theme.textSub, fontWeight: 600 }}>
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Paper elevation={0} sx={{ borderRadius: '20px', border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: `1px solid ${theme.border}`, px: 3 }}>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}
              sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}>
              <Tab label={`👥 Users (${regularUsers.length})`} />
              <Tab label={`🔑 Admins (${adminUsers.length})`} />
              <Tab label={`🎟️ Tickets (${stats.openTickets} open)`} />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>

            {/* Users Tab */}
            {activeTab === 0 && (
              <Box>
                {regularUsers.length === 0 ? (
                  <Typography sx={{ color: theme.textMuted, textAlign: 'center', py: 4 }}>No users found</Typography>
                ) : regularUsers.map(u => <UserCard key={u.id} u={u} isAdmin={false} />)}
              </Box>
            )}

            {/* Admins Tab */}
            {activeTab === 1 && (
              <Box>
                {adminUsers.length === 0 ? (
                  <Typography sx={{ color: theme.textMuted, textAlign: 'center', py: 4 }}>No admins found</Typography>
                ) : adminUsers.map(u => <UserCard key={u.id} u={u} isAdmin={true} />)}
              </Box>
            )}

            {/* Tickets Tab */}
            {activeTab === 2 && (
              <Box>
                {tickets.length === 0 ? (
                  <Typography sx={{ color: theme.textMuted, textAlign: 'center', py: 4 }}>No tickets found</Typography>
                ) : tickets.map(ticket => (
                  <Box key={ticket.id} sx={{
                    p: 2.5, mb: 2, borderRadius: '16px',
                    border: `1px solid ${ticket.status === 'open' ? theme.warning + '60' : theme.border}`,
                    bgcolor: ticket.status === 'open' ? '#FFFBEB' : theme.bg,
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip label={ticket.category || 'general'} size="small"
                          sx={{ bgcolor: theme.primaryBg, color: theme.primary, fontWeight: 600, fontSize: '0.7rem' }} />
                        <Chip
                          label={ticket.status}
                          size="small"
                          icon={ticket.status === 'open' ? <Clock size={12} /> : <CheckCircle size={12} />}
                          sx={{
                            bgcolor: ticket.status === 'open' ? '#FFFBEB' : theme.successBg,
                            color:   ticket.status === 'open' ? theme.warning : theme.success,
                            fontWeight: 700, fontSize: '0.7rem',
                          }}
                        />
                      </Box>
                      {ticket.status === 'open' && (
                        <Button size="small" onClick={() => handleCloseTicket(ticket.id)}
                          sx={{
                            textTransform: 'none', fontWeight: 600, fontSize: '0.75rem',
                            borderRadius: '10px', color: theme.success, bgcolor: theme.successBg,
                            '&:hover': { bgcolor: '#D1FAE5' },
                          }}>
                          Close Ticket
                        </Button>
                      )}
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: theme.textMain, mb: 0.5 }}>
                      {ticket.subject}
                    </Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: theme.textSub, lineHeight: 1.6, mb: 1 }}>
                      {ticket.message}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: theme.textMuted }}>
                      From: {ticket.email} · {ticket.createdAt?.toDate?.()?.toLocaleString() || '—'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

          </Box>
        </Paper>
      </Box>
    </Box>
  );
}