export default function BioSenseLogo({ variant = 'sidebar', iconSize: customIconSize, fontSize: customFontSize }) {
  const variants = {
    sidebar: { iconSize: 40, fontSize: 18, showText: true,  showSubtitle: false },
    mobile:  { iconSize: 32, fontSize: 15, showText: true,  showSubtitle: false },
    splash:  { iconSize: 90, fontSize: 36, showText: true,  showSubtitle: true  },
    icon:    { iconSize: 110, fontSize: 0,  showText: false, showSubtitle: false },
  };

    const base = variants[variant];
  const iconSize = customIconSize || base.iconSize;
  const fontSize = customFontSize || base.fontSize;
  const { showText, showSubtitle } = base;
  const id = `logoG_${variant}`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: iconSize * 0.25 }}>
      {/* Иконка */}
      <svg width={iconSize} height={iconSize} viewBox="0 0 60 60" fill="none">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        <rect width="60" height="60" rx="16" fill={`url(#${id})`} />

        {/* Центральный атом */}
        <circle cx="30" cy="30" r="5" fill="white" />

        {/* Боковые атомы */}
        <circle cx="14" cy="20" r="3.5" fill="white" opacity="0.9" />
        <circle cx="46" cy="20" r="3.5" fill="white" opacity="0.9" />
        <circle cx="14" cy="40" r="3.5" fill="white" opacity="0.9" />
        <circle cx="46" cy="40" r="3.5" fill="white" opacity="0.9" />

        {/* Верхний и нижний атомы */}
        <circle cx="30" cy="12" r="2.5" fill="white" opacity="0.7" />
        <circle cx="30" cy="48" r="2.5" fill="white" opacity="0.7" />

        {/* Основные связи */}
        <line x1="30" y1="30" x2="14" y2="20" stroke="white" strokeWidth="1.5" opacity="0.7" />
        <line x1="30" y1="30" x2="46" y2="20" stroke="white" strokeWidth="1.5" opacity="0.7" />
        <line x1="30" y1="30" x2="14" y2="40" stroke="white" strokeWidth="1.5" opacity="0.7" />
        <line x1="30" y1="30" x2="46" y2="40" stroke="white" strokeWidth="1.5" opacity="0.7" />
        <line x1="30" y1="30" x2="30" y2="12" stroke="white" strokeWidth="1.5" opacity="0.7" />
        <line x1="30" y1="30" x2="30" y2="48" stroke="white" strokeWidth="1.5" opacity="0.7" />

        {/* Дополнительные связи */}
        <line x1="14" y1="20" x2="30" y2="12" stroke="white" strokeWidth="1" opacity="0.4" />
        <line x1="46" y1="20" x2="30" y2="12" stroke="white" strokeWidth="1" opacity="0.4" />
        <line x1="14" y1="40" x2="30" y2="48" stroke="white" strokeWidth="1" opacity="0.4" />
        <line x1="46" y1="40" x2="30" y2="48" stroke="white" strokeWidth="1" opacity="0.4" />
        <line x1="14" y1="20" x2="14" y2="40" stroke="white" strokeWidth="1" opacity="0.4" />
        <line x1="46" y1="20" x2="46" y2="40" stroke="white" strokeWidth="1" opacity="0.4" />

        {/* Пульс снизу */}
        <polyline
          points="8,52 13,52 16,46 19,56 22,48 25,52 32,52"
          stroke="white" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round"
          fill="none" opacity="0.85"
        />
      </svg>

      {/* Текст */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{
            fontSize,
            fontWeight: 900,
            lineHeight: 1.1,
            background: 'linear-gradient(135deg, #10B981, #2563EB)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'Inter, sans-serif',
          }}>
            BioSense
          </span>
          {showSubtitle && (
            <span style={{
              fontSize: fontSize * 0.35,
              fontWeight: 700,
              color: '#94A3B8',
              letterSpacing: 2,
              textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif',
            }}>
              Health Monitor
            </span>
          )}
        </div>
      )}
    </div>
  );
}