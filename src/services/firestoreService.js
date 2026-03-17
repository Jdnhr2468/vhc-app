// src/services/firestoreService.js
// Центральный сервис для всех Firestore операций

import {
  doc, getDoc, setDoc, deleteDoc,updateDoc,
  collection, addDoc, getDocs,
  query, orderBy, onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// ══════════════════════════════════════════
// 👤 ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ
// ══════════════════════════════════════════

// Получить профиль пользователя
export const getUserProfile = async (uid) => {
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();
    return null;
  } catch (err) {
    console.error('getUserProfile error:', err);
    return null;
  }
};

// Сохранить/обновить профиль
export const updateUserProfile = async (uid, data) => {
  try {
    const ref = doc(db, 'users', uid);
    // merge: true — добавляет новые поля не удаляя старые
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (err) {
    console.error('updateUserProfile error:', err);
    return false;
  }
};

// ══════════════════════════════════════════
// 📊 БИОМАРКЕРЫ
// ══════════════════════════════════════════

// Сохранить запись биомаркеров
export const saveBiomarkers = async (uid, data) => {
  try {
    const ref = collection(db, 'users', uid, 'biomarkers');
    await addDoc(ref, {
      ...data,
      timestamp: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error('saveBiomarkers error:', err);
    return false;
  }
};

// Получить последние N записей биомаркеров
export const getBiomarkers = async (uid, limitCount = 7) => {
  try {
    const ref = collection(db, 'users', uid, 'biomarkers');
    const q   = query(ref, orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.slice(0, limitCount).map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getBiomarkers error:', err);
    return [];
  }
};

// Слушать биомаркеры в реальном времени
export const subscribeBiomarkers = (uid, callback) => {
  const ref = collection(db, 'users', uid, 'biomarkers');
  const q   = query(ref, orderBy('timestamp', 'desc'));
  return onSnapshot(q, snap => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
};

// ══════════════════════════════════════════
// 🔔 АЛЕРТЫ
// ══════════════════════════════════════════

// Получить все алерты пользователя
export const getAlerts = async (uid) => {
  try {
    const ref  = collection(db, 'users', uid, 'alerts');
    const q    = query(ref, orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getAlerts error:', err);
    return [];
  }
};

// Добавить алерт (автоматически при аномальных значениях)
export const addAlert = async (uid, alert) => {
  try {
    const ref = collection(db, 'users', uid, 'alerts');
    await addDoc(ref, {
      ...alert,
      read: false,
      timestamp: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error('addAlert error:', err);
    return false;
  }
};

// Пометить алерт как прочитанный
export const markAlertRead = async (uid, alertId, readStatus = true) => {
  try {
    const ref = doc(db, 'users', uid, 'alerts', alertId);
    await updateDoc(ref, { read: readStatus });
    return true;
  } catch (err) {
    console.error('markAlertRead error:', err);
    return false;
  }
};

// Слушать алерты в реальном времени
export const subscribeAlerts = (uid, callback) => {
  const ref = collection(db, 'users', uid, 'alerts');
  const q   = query(ref, orderBy('timestamp', 'desc'));
  return onSnapshot(q, snap => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
};

// ══════════════════════════════════════════
// ⚙️ НАСТРОЙКИ ПОЛЬЗОВАТЕЛЯ
// ══════════════════════════════════════════

// Получить настройки
export const getUserSettings = async (uid) => {
  try {
    const ref  = doc(db, 'users', uid, 'settings', 'preferences');
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();
    // Настройки по умолчанию
    return {
      language: 'english',
      units: { glucose: 'mmol', weight: 'kg' },
      notifications: {
        critical: true, reminders: true, goals: true, reports: false,
      },
      notifTime: 'morning',
      fontSize: 2,
    };
  } catch (err) {
    console.error('getUserSettings error:', err);
    return null;
  }
};

// Сохранить настройки
export const saveUserSettings = async (uid, settings) => {
  try {
    const ref = doc(db, 'users', uid, 'settings', 'preferences');
    await setDoc(ref, { ...settings, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (err) {
    console.error('saveUserSettings error:', err);
    return false;
  }
};

// ══════════════════════════════════════════
// 🤖 АВТОМАТИЧЕСКИЕ АЛЕРТЫ ПО ПОРОГАМ
// ══════════════════════════════════════════

// Проверить биомаркеры и создать алерт если вне нормы
export const checkAndCreateAlert = async (uid, vitals) => {
  const alerts = [];

  if (vitals.hr > 100 || vitals.hr < 50) {
    alerts.push({
      type: 'Irregular Heart Rate Pattern',
      desc: `Heart rate is ${vitals.hr} bpm — outside normal range (50-100).`,
      severity: 'high',
      biomarker: 'heartRate',
    });
  }
  if (vitals.gl > 7.8) {
    alerts.push({
      type: 'High Glucose Level',
      desc: `Glucose is ${vitals.gl} mmol/L — above normal range (4.0-7.8).`,
      severity: 'medium',
      biomarker: 'glucose',
    });
  }
  if (vitals.ox < 95) {
    alerts.push({
      type: 'Low Oxygen Level',
      desc: `SpO2 dropped to ${vitals.ox}% — below safe threshold (95%).`,
      severity: 'high',
      biomarker: 'oxygen',
    });
  }

  for (const alert of alerts) {
    await addAlert(uid, alert);
  }

  return alerts.length;
};

// ══════════════════════════════════════════
// 📱 УСТРОЙСТВА
// ══════════════════════════════════════════

// Получить все устройства пользователя
export const getDevices = async (uid) => {
  try {
    const ref  = collection(db, 'users', uid, 'devices');
    const q    = query(ref, orderBy('connectedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getDevices error:', err);
    return [];
  }
};

// ── ИСПРАВЛЕНО: btDeviceId для поиска дубликатов, firestoreId для документа ──
export const saveDevice = async (uid, device) => {
  try {
    if (device.firestoreId) {
      // Обновляем существующий документ (rename, reconnect)
      const ref = doc(db, 'users', uid, 'devices', device.firestoreId);
      await setDoc(ref, { ...device, connectedAt: serverTimestamp() }, { merge: true });
    } else {
      // Проверяем нет ли уже устройства с таким btDeviceId
      if (device.btDeviceId) {
        const ref  = collection(db, 'users', uid, 'devices');
        const snap = await getDocs(ref);
        const existing = snap.docs.find(d => d.data().btDeviceId === device.btDeviceId);
        if (existing) {
          // Обновляем существующее
          await setDoc(doc(db, 'users', uid, 'devices', existing.id),
            { ...device, firestoreId: existing.id, connectedAt: serverTimestamp() },
            { merge: true }
          );
          return true;
        }
      }
      // Создаём новый документ
      const ref    = collection(db, 'users', uid, 'devices');
      const newDoc = await addDoc(ref, { ...device, connectedAt: serverTimestamp() });
      // Сохраняем firestoreId в документе
      await updateDoc(newDoc, { firestoreId: newDoc.id });
    }
    return true;
  } catch (err) {
    console.error('saveDevice error:', err);
    return false;
  }
};

export const updateDeviceStatus = async (uid, deviceId, connected) => {
  try {
    const ref = doc(db, 'users', uid, 'devices', deviceId);
    await updateDoc(ref, { connected, updatedAt: serverTimestamp() });
    return true;
  } catch (err) {
    console.error('updateDeviceStatus error:', err);
    return false;
  }
};

export const subscribeDevices = (uid, callback) => {
  const ref = collection(db, 'users', uid, 'devices');
  const q   = query(ref, orderBy('connectedAt', 'desc'));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

export const deleteDevice = async (uid, deviceId) => {
  try {
    const ref = doc(db, 'users', uid, 'devices', deviceId);
    await deleteDoc(ref);
    return true;
  } catch (err) {
    console.error('deleteDevice error:', err);
    return false;
  }
};

export const subscribeSettings = (uid, callback) => {
  const ref = doc(db, 'users', uid, 'settings', 'preferences');
  return onSnapshot(ref, snap => {
    if (snap.exists()) callback(snap.data());
  });
};