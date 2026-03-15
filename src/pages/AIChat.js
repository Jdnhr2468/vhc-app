import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, IconButton, TextField, Avatar
} from '@mui/material';
import { X, Send, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { auth } from '../services/firebase';

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

export default function AIChat({ vitals }) {
  const user = auth.currentUser;

  const [open,      setOpen]      = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages,  setMessages]  = useState([
    {
      role: 'assistant',
      text: `Hi ${user?.displayName?.split(' ')[0] || 'there'}!  I'm your BioSense AI health advisor. Ask me anything about your health data, symptoms, or lifestyle tips!`,
    }
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);

  const [pos, setPos] = useState({
    x: window.innerWidth  - 380,
    y: window.innerHeight - 560,
  });

  const dragging   = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const chatRef        = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // МЫШЬ — drag
  const onMouseDown = (e) => {
    dragging.current   = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging.current) return;
      const newX = Math.max(0, Math.min(window.innerWidth  - 360, e.clientX - dragOffset.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 60,  e.clientY - dragOffset.current.y));
      setPos({ x: newX, y: newY });
    };
    const onMouseUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
    };
  }, []);

  // TOUCH — drag для мобильного
  const onTouchStart = (e) => {
    const touch = e.touches[0];
    dragging.current   = true;
    dragOffset.current = { x: touch.clientX - pos.x, y: touch.clientY - pos.y };
  };

  useEffect(() => {
    const onTouchMove = (e) => {
      if (!dragging.current) return;
      const touch = e.touches[0];
      const newX = Math.max(0, Math.min(window.innerWidth  - 320, touch.clientX - dragOffset.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 60,  touch.clientY - dragOffset.current.y));
      setPos({ x: newX, y: newY });
      e.preventDefault();
    };
    const onTouchEnd = () => { dragging.current = false; };
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend',  onTouchEnd);
    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend',  onTouchEnd);
    };
  }, []);

  // Кнопка (закрытый чат) — draggable на мобильном
  const btnDragging   = useRef(false);
  const btnDragOffset = useRef({ x: 0, y: 0 });
  const btnMoved      = useRef(false);
  const [btnPos, setBtnPos] = useState({ x: window.innerWidth - 86, y: window.innerHeight - 100 });

  const onBtnTouchStart = (e) => {
    const touch = e.touches[0];
    btnDragging.current   = true;
    btnMoved.current      = false;
    btnDragOffset.current = { x: touch.clientX - btnPos.x, y: touch.clientY - btnPos.y };
  };

  useEffect(() => {
    const onBtnTouchMove = (e) => {
      if (!btnDragging.current) return;
      btnMoved.current = true;
      const touch = e.touches[0];
      const newX = Math.max(0, Math.min(window.innerWidth  - 58, touch.clientX - btnDragOffset.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 58, touch.clientY - btnDragOffset.current.y));
      setBtnPos({ x: newX, y: newY });
      e.preventDefault();
    };
    const onBtnTouchEnd = () => { btnDragging.current = false; };
    window.addEventListener('touchmove', onBtnTouchMove, { passive: false });
    window.addEventListener('touchend',  onBtnTouchEnd);
    return () => {
      window.removeEventListener('touchmove', onBtnTouchMove);
      window.removeEventListener('touchend',  onBtnTouchEnd);
    };
  }, [btnPos]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const vitalsContext = vitals ? `
Current patient biomarkers:
- Heart Rate: ${vitals.hr} bpm
- Blood Pressure: ${vitals.bp} mmHg
- Oxygen Level: ${vitals.ox}%
- Glucose: ${vitals.gl} mmol/L
- Steps Today: ${vitals.steps}
- Calories Burned: ${vitals.cal} kcal
` : '';

      const apiMessages = messages
        .slice(1)
        .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));
      apiMessages.push({ role: 'user', content: userText });

      const response = await fetch('/api/claude/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are BioSense AI, a friendly and knowledgeable personal health advisor integrated into the BioSense health monitoring app.

          ${vitalsContext}
Your role:
- Provide helpful, personalized health advice based on the user's biomarker data
- Be conversational, warm, and encouraging
- Keep responses concise (2-4 sentences max unless asked for detail)
- Always remind users to consult a doctor for medical decisions
- Use emojis occasionally to keep tone friendly
- Never diagnose conditions — only provide general wellness advice

User name: ${user?.displayName || 'User'}`,
          messages: apiMessages,
        }),
      });

      const data  = await response.json();
      const reply = data.content?.[0]?.text || 'Sorry, I could not process your request.';
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    }
     catch (err) {
      console.error('AIChat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!open) return (
    <Box
      onTouchStart={onBtnTouchStart}
      onClick={() => { if (!btnMoved.current) setOpen(true); }}
      sx={{
        position: 'fixed',
        bottom: { md: 28 },
        right:  { md: 28 },
        left:   { xs: btnPos.x, md: 'auto' },
        top:    { xs: btnPos.y, md: 'auto' },
        zIndex: 9999,
        width: 58, height: 58, borderRadius: '50%',
        background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 8px 32px rgba(37,99,235,0.4)',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 12px 40px rgba(37,99,235,0.5)' },
        animation: 'float 3s ease-in-out infinite',
        '@keyframes float': {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-6px)' },
        },
      }}>
      <Sparkles size={26} color="white" />
    </Box>
  );

  return (
    <Box ref={chatRef} sx={{
      position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999,
      width: { xs: 320, md: 360 },
      borderRadius: '24px', overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      border: `1px solid ${theme.border}`,
      bgcolor: theme.white, userSelect: 'none',
    }}>

      {/* Шапка — drag zone */}
      <Box
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        sx={{
          background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
          p: 2, cursor: 'grab',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          '&:active': { cursor: 'grabbing' },
          touchAction: 'none',
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 0.8, borderRadius: '10px', display: 'flex' }}>
            <Sparkles size={18} color="white" />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: 'white', fontSize: '0.95rem' }}>
              BioSense AI
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4ADE80' }} />
              <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)' }}>
                Online · drag to move
              </Typography>
            </Box>
          </Box>
        </Box>

      
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={() => setMinimized(!minimized)}
            sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
            {minimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </IconButton>
          <IconButton size="small" onClick={() => setOpen(false)}
            sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.15)' } }}>
            <X size={16} />
          </IconButton>
        </Box>
      </Box>

      {!minimized && (
        <>
          <Box sx={{
            height: { xs: 320, md: 380 }, overflowY: 'auto', p: 2,
            display: 'flex', flexDirection: 'column', gap: 1.5,
            bgcolor: theme.bg,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: theme.border, borderRadius: 2 },
          }}>
            {messages.map((msg, i) => (
              <Box key={i} sx={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-end', gap: 1,
              }}>
                {msg.role === 'assistant' && (
                  <Box sx={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Sparkles size={14} color="white" />
                  </Box>
                )}

                <Box sx={{
                  maxWidth: '78%', px: 1.8, py: 1.2,
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  bgcolor: msg.role === 'user' ? theme.primary : theme.white,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: msg.role === 'assistant' ? `1px solid ${theme.border}` : 'none',
                }}>
                  <Typography sx={{
                    fontSize: '0.85rem',
                    color: msg.role === 'user' ? 'white' : theme.textMain,
                    lineHeight: 1.6, whiteSpace: 'pre-wrap',
                  }}>
                    {msg.text}
                  </Typography>
                </Box>

                {msg.role === 'user' && (
                  <Avatar sx={{ width: 28, height: 28, bgcolor: '#DBEAFE',
                    color: theme.primary, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                    {(user?.displayName || user?.email)?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                )}
              </Box>
            ))}
            
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                <Box sx={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Sparkles size={14} color="white" />
                </Box>
                <Box sx={{ px: 2, py: 1.5, borderRadius: '18px 18px 18px 4px',
                  bgcolor: theme.white, border: `1px solid ${theme.border}`,
                  display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <Box key={i} sx={{
                      width: 7, height: 7, borderRadius: '50%', bgcolor: theme.primary,
                      animation: 'bounce 1.2s infinite',
                      animationDelay: `${i * 0.2}s`,
                      '@keyframes bounce': {
                        '0%,80%,100%': { transform: 'scale(0.6)', opacity: 0.4 },
                        '40%':         { transform: 'scale(1)',   opacity: 1   },
                      },
                    }} />
                  ))}
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ px: 2, py: 1, display: 'flex', gap: 0.8, flexWrap: 'wrap',
            bgcolor: theme.white, borderTop: `1px solid ${theme.border}` }}>
            {['How are my vitals?', 'Any health tips?', 'Improve my glucose?'].map(q => (
              <Box key={q} onClick={() => setInput(q)} sx={{
                px: 1.5, py: 0.5, borderRadius: '20px', cursor: 'pointer',
                border: `1px solid ${theme.border}`, bgcolor: theme.bg,
                fontSize: '0.72rem', fontWeight: 600, color: theme.textSub,
                transition: 'all 0.15s',
                '&:hover': { bgcolor: theme.primaryBg, borderColor: theme.primary, color: theme.primary },
              }}>
                {q}
              </Box>
            ))}
          </Box>

          <Box sx={{ p: 1.5, bgcolor: theme.white, display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField fullWidth multiline maxRows={3}
              placeholder="Ask about your health..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px', fontSize: '0.88rem', bgcolor: theme.bg,
                  '& fieldset': { borderColor: theme.border },
                  '&:hover fieldset': { borderColor: theme.primary },
                  '&.Mui-focused fieldset': { borderColor: theme.primary },
                },
              }}
            />
            <IconButton onClick={sendMessage} disabled={!input.trim() || loading}
              sx={{
                background: input.trim() && !loading
                  ? 'linear-gradient(135deg, #2563EB, #7C3AED)' : theme.border,
                color: 'white', p: 1.2, borderRadius: '14px', flexShrink: 0,
                '&:hover': { opacity: 0.9 },
                '&:disabled': { bgcolor: theme.border },
                transition: 'all 0.2s',
              }}>
              <Send size={18} />
            </IconButton>
          </Box>
        </>
      )}
    </Box>
  );
}