import { useEffect, useRef, useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 минут
const WARNING_TIME = 60 * 1000;       // предупреждение за 1 минуту

export default function useIdleTimer(onWarning, onLogout) {
  const timer        = useRef(null);
  const warningTimer = useRef(null);

  const resetTimer = useCallback(() => {
    clearTimeout(timer.current);
    clearTimeout(warningTimer.current);

    // Предупреждение за 1 минуту до выхода
    warningTimer.current = setTimeout(() => {
      onWarning && onWarning();
    }, IDLE_TIMEOUT - WARNING_TIME);

    // Автовыход
    timer.current = setTimeout(async () => {
      onLogout && onLogout();
      await signOut(auth);
    }, IDLE_TIMEOUT);
  }, [onWarning, onLogout]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearTimeout(timer.current);
      clearTimeout(warningTimer.current);
    };
  }, [resetTimer]);
}