import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { getUserSettings } from '../services/firestoreService';

const translations = {
  english: {
    dashboard:      'Health Dashboard',
    welcomeBack:    'Welcome back',
    devices:        'Devices',
    alerts:         'Alerts',
    reports:        'Reports',
    settings:       'Settings',
    logout:         'Logout',
    heartRate:      'Heart Rate',
    bloodPressure:  'Blood Pressure',
    oxygenLevel:    'Oxygen Level',
    glucose:        'Glucose',
    stepsToday:     'Steps Today',
    caloriesBurned: 'Calories Burned',
    normal:         '✓ Normal',
    high:           '⚠ High',
    low:            '⚠ Low',
    optimal:        '✓ Optimal',
    active:         '↑ Active',
    onTrack:        '↑ On track',
    weeklyActivity: 'Weekly Activity',
    stepsWeek:      'Steps over the past week',
    todayInsight:   "Today's Insight",
    viewReports:    'View Reports →',
    live:           'Live',
    liveMonitoring: 'Live Monitoring',
    patient:        'Patient',
    noUnread:       'All caught up — no unread alerts',
    unreadAlerts:   'unread notification',
    markAllRead:    'Mark all as read',
    searchAlerts:   'Search alerts...',
    unreadOnly:     'Unread only',
    noAlerts:       'No alerts found',
    connected:      'Connected',
    disconnected:   'Disconnected',
    totalDevices:   'Total Devices',
    addDevice:      'Add Device',
    noDevices:      'No devices connected yet',
    reconnect:      'Reconnect',
    disconnect:     'Disconnect',
    saveChanges:    'Save Changes',
    saving:         'Saving...',
    saved:          'Saved!',
    language:       'Language',
    units:          'Units',
    accessibility:  'Accessibility',
    notifications:  'Notifications',
    thresholds:     'Alert Thresholds',
    dashboardCards: 'Dashboard Cards',
    about:          'About',
    dailySummary: 'Daily Health Summary',
  },
  russian: {
    dashboard:      'Панель здоровья',
    welcomeBack:    'Добро пожаловать',
    devices:        'Устройства',
    alerts:         'Уведомления',
    reports:        'Отчёты',
    settings:       'Настройки',
    logout:         'Выйти',
    heartRate:      'Пульс',
    bloodPressure:  'Давление',
    oxygenLevel:    'Кислород',
    glucose:        'Глюкоза',
    stepsToday:     'Шаги сегодня',
    caloriesBurned: 'Сожжено калорий',
    normal:         '✓ Норма',
    high:           '⚠ Высокий',
    low:            '⚠ Низкий',
    optimal:        '✓ Оптимально',
    active:         '↑ Активно',
    onTrack:        '↑ В норме',
    weeklyActivity: 'Активность за неделю',
    stepsWeek:      'Шаги за прошедшую неделю',
    todayInsight:   'Совет дня',
    viewReports:    'Смотреть отчёты →',
    live:           'Онлайн',
    liveMonitoring: 'Мониторинг',
    patient:        'Пациент',
    noUnread:       'Всё прочитано',
    unreadAlerts:   'непрочитанных',
    markAllRead:    'Прочитать все',
    searchAlerts:   'Поиск...',
    unreadOnly:     'Только непрочитанные',
    noAlerts:       'Уведомлений нет',
    connected:      'Подключено',
    disconnected:   'Отключено',
    totalDevices:   'Всего устройств',
    addDevice:      'Добавить',
    noDevices:      'Нет подключённых устройств',
    reconnect:      'Переподключить',
    disconnect:     'Отключить',
    saveChanges:    'Сохранить',
    saving:         'Сохраняем...',
    saved:          'Сохранено!',
    language:       'Язык',
    units:          'Единицы',
    accessibility:  'Доступность',
    notifications:  'Уведомления',
    thresholds:     'Пороги',
    dashboardCards: 'Карточки',
    about:          'О приложении',
    dailySummary: 'Ежедневная сводка',
  },
  kazakh: {
    dashboard:      'Денсаулық панелі',
    welcomeBack:    'Қош келдіңіз',
    devices:        'Құрылғылар',
    alerts:         'Хабарландырулар',
    reports:        'Есептер',
    settings:       'Параметрлер',
    logout:         'Шығу',
    heartRate:      'Жүрек соғысы',
    bloodPressure:  'Қан қысымы',
    oxygenLevel:    'Оттегі',
    glucose:        'Глюкоза',
    stepsToday:     'Бүгінгі қадамдар',
    caloriesBurned: 'Жағылған калория',
    normal:         '✓ Қалыпты',
    high:           '⚠ Жоғары',
    low:            '⚠ Төмен',
    optimal:        '✓ Оңтайлы',
    active:         '↑ Белсенді',
    onTrack:        '↑ Қалыпты',
    weeklyActivity: 'Апталық белсенділік',
    stepsWeek:      'Өткен аптадағы қадамдар',
    todayInsight:   'Күнделікті кеңес',
    viewReports:    'Есептерді көру →',
    live:           'Тікелей',
    liveMonitoring: 'Мониторинг',
    patient:        'Пациент',
    noUnread:       'Барлығы оқылды',
    unreadAlerts:   'оқылмаған',
    markAllRead:    'Барлығын оқу',
    searchAlerts:   'Іздеу...',
    unreadOnly:     'Тек оқылмағандар',
    noAlerts:       'Хабарландыру жоқ',
    connected:      'Қосылған',
    disconnected:   'Ажыратылған',
    totalDevices:   'Барлық құрылғылар',
    addDevice:      'Қосу',
    noDevices:      'Қосылған құрылғы жоқ',
    reconnect:      'Қайта қосу',
    disconnect:     'Ажырату',
    saveChanges:    'Сақтау',
    saving:         'Сақталуда...',
    saved:          'Сақталды!',
    language:       'Тіл',
    units:          'Өлшемдер',
    accessibility:  'Қолжетімділік',
    notifications:  'Хабарландырулар',
    thresholds:     'Шектер',
    dashboardCards: 'Карточкалар',
    about:          'Қолданба туралы',
    dailySummary: 'Күнделікті қорытынды',
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('english');
  const [fontSize, setFontSize] = useState(2); // 1=Small, 2=Medium, 3=Large, 4=X-Large

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      const settings = await getUserSettings(user.uid);
      if (settings?.language) setLanguage(settings.language);
      if (settings?.fontSize) setFontSize(settings.fontSize);
    });
    return () => unsubscribe();
  }, []);

  // Размер шрифта в rem
  const fontScale = {
    1: 0.85,  // Small
    2: 1.0,   // Medium
    3: 1.15,  // Large
    4: 1.3,   // X-Large
  }[fontSize] || 1.0;

  const t = translations[language] || translations.english;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, fontSize, setFontSize, fontScale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);