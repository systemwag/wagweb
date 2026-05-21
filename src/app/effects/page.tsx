"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './effects.module.css';

interface EffectItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  code: string;
  principles: string;
  hasControls?: boolean;
}

export default function EffectsPlayground() {
  const [activeTab, setActiveTab] = useState<string>('cards');
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  
  // Dynamic preview states
  const [pingColor, setPingColor] = useState<'teal' | 'gold'>('teal');
  const [pingSpeed, setPingSpeed] = useState<'normal' | 'fast'>('normal');
  const [glowActive, setGlowActive] = useState<boolean>(true);
  const [stripeSpeed, setStripeSpeed] = useState<'normal' | 'slow'>('normal');
  
  // Extra WOW effect states
  const [logoSpeed, setLogoSpeed] = useState<'normal' | 'fast' | 'slow'>('normal');
  const [pathStroke, setPathStroke] = useState<number>(2.5);
  const [floatSpeed, setFloatSpeed] = useState<'normal' | 'fast'>('normal');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, active: false });

  const effectsList: EffectItem[] = [
    {
      id: 'cards',
      badge: 'Дизайн-система: Карточки',
      title: 'Интерактивная стеклянная карточка',
      description: 'Центральный интерфейсный элемент West Arlan Group. Обладает эффектом матового стекла (glassmorphism), тонкой адаптивной границей и мягким смещением по вертикали при наведении.',
      principles: 'Смещение вверх на -5px создает ощущение физической "приподнятости" и отклика на действие пользователя. Использование cubic-bezier(0.16, 1, 0.3, 1) вместо linear обеспечивает премиальную плавность торможения (ease-out).',
      code: `/* CSS Module */
.card {
  background: var(--glass-bg, rgba(255, 255, 255, 0.85));
  border: 1px solid var(--glass-border, rgba(15, 23, 42, 0.06));
  border-radius: var(--radius-md, 24px);
  backdrop-filter: blur(20px);
  transition: 
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.03);
}

.card:hover {
  transform: translateY(-5px);
  border-color: var(--border-gold, rgba(26, 115, 232, 0.12));
  box-shadow: 
    0 20px 40px rgba(26, 115, 232, 0.05),
    0 1px 3px rgba(15, 23, 42, 0.02);
}`
    },
    {
      id: 'buttons',
      badge: 'Микро-взаимодействия: Кнопки',
      title: 'Интерактивные кнопки с масштабированием',
      description: 'Кнопки обладают тонким эффектом глубины. При наведении они приподнимаются и расширяют тень, а при клике уходят на легкое уменьшение, давая четкий тактильный отклик.',
      principles: 'Масштабирование scale(1.02) при наведении увеличивает визуальный вес кнопки, а scale(0.98) при нажатии имитирует физический прогиб клавиши, подтверждая клик еще до загрузки страницы.',
      code: `/* CSS Module */
.btnPrimary {
  background: var(--gold, #1a73e8);
  color: #ffffff;
  padding: 12px 28px;
  border-radius: var(--radius-sm, 30px);
  transition: 
    background-color 0.2s, 
    transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), 
    box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(26, 115, 232, 0.15);
}

.btnPrimary:hover {
  background: var(--gold-light, #2563eb);
  transform: translateY(-1.5px) scale(1.02);
  box-shadow: 0 8px 20px rgba(26, 115, 232, 0.25);
}

.btnPrimary:active {
  transform: translateY(0) scale(0.98);
}`
    },
    {
      id: 'pings',
      badge: 'Индикация: Состояние системы',
      title: 'Пульсирующий маяк статуса (Live Ping)',
      description: 'Супер-минималистичный индикатор активности, транслирующий концентрические круги наружу. Используется на картах объектов и в шапке сайта для отображения живых статусов.',
      principles: 'Бесконечная плавная анимация расширения окружности от центра с постепенным угасанием opacity. Не перегружает интерфейс в отличие от резкого мигания.',
      hasControls: true,
      code: `/* CSS Module */
.pingNode {
  position: relative;
  width: 9px; height: 9px;
  border-radius: 50%;
  background-color: var(--teal, #0d9488);
}

.pingRing {
  position: absolute;
  top: -6px; left: -6px;
  width: 21px; height: 21px;
  border-radius: 50%;
  border: 1.5px solid var(--teal, #0d9488);
  opacity: 0;
  transform: scale(0.3);
  animation: signal-ping 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

@keyframes signal-ping {
  0% { transform: scale(0.35); opacity: 0.7; }
  100% { transform: scale(1.15); opacity: 0; }
}`
    },
    {
      id: 'glow',
      badge: 'Световой дизайн: Подсветка',
      title: 'Диффузный фоновый прожектор (Spotlight)',
      description: 'Создает ощущение глубины в светлой теме за счет размытых, медленно дрейфующих световых шаров в фоне компонентов.',
      principles: 'Сверхвысокое размытие (blur 10px - 40px) и низкая непрозрачность цветных радиальных градиентов формируют чистое "интерьерное" освещение, отделяя контент от фона.',
      hasControls: true,
      code: `/* CSS Module */
.glowBlob {
  position: absolute;
  width: 160px; height: 160px;
  border-radius: 50%;
  background: radial-gradient(
    circle, 
    rgba(26, 115, 232, 0.16) 0%, 
    transparent 70%
  );
  filter: blur(10px);
  animation: glowFloat 8s ease-in-out infinite alternate;
}

@keyframes glowFloat {
  0% { transform: translate(-30px, -20px) scale(0.9); }
  100% { transform: translate(30px, 20px) scale(1.1); }
}`
    },
    {
      id: 'grids',
      badge: 'Техническая эстетика: Сетки',
      title: 'Анимированная чертежная сетка (Blueprint)',
      description: 'Строгая инженерная деталь. Тонкая анимированная сетка с мягко проплывающей световой полосой, подчеркивающая проектную точность West Arlan Group.',
      principles: 'Использование линейных градиентов с размером 20px на 20px создает масштабируемую вектороподобную сетку. Мягкая проплывающая полоса оживляет статичный фон.',
      hasControls: true,
      code: `/* CSS Module */
.blueprintGrid {
  background-image: 
    linear-gradient(rgba(26, 115, 232, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(26, 115, 232, 0.04) 1px, transparent 1px);
  background-size: 20px 20px;
  position: relative;
}

.movingStripe {
  position: absolute;
  left: 0; width: 100%; height: 80px;
  background: linear-gradient(
    to bottom, 
    transparent, 
    rgba(26, 115, 232, 0.025), 
    transparent
  );
  animation: gridStripeMove 6s linear infinite;
}

@keyframes gridStripeMove {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(400px); }
}`
    },
    {
      id: 'logo3D',
      badge: 'Брендинг: 3D Перспектива',
      title: '3D Орбитальное вращение логотипа',
      description: 'Кинетическая трехмерная модель фирменного логотипа WAG, плавно вращающаяся в трехмерном пространстве вокруг вертикальной оси с перспективным искажением.',
      principles: 'Анимация использует transform-style: preserve-3d и свойство perspective на родительском контейнере для честного 3D-рендеринга силами GPU без замедления страницы.',
      hasControls: true,
      code: `/* CSS Module */
.logo3DWrapper {
  perspective: 800px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo3D {
  width: 90px;
  height: 90px;
  position: relative;
  transform-style: preserve-3d;
  animation: wagSpin3D 10s linear infinite;
  cursor: pointer;
  transition: animation-duration 0.5s;
}

.logo3D:hover {
  animation-duration: 3s; /* Ускорение наведении */
}

@keyframes wagSpin3D {
  0% { transform: rotateY(0deg) rotateX(15deg); }
  100% { transform: rotateY(360deg) rotateX(15deg); }
}`
    },
    {
      id: 'crosshair',
      badge: 'Гео-инжиниринг: Интерактив',
      title: 'Интерактивный прицел координат',
      description: 'Инженерная система наведения с динамическими осями X/Y, следующая за курсором мыши, и всплывающей плашкой точных пиксельных координат.',
      principles: 'Отслеживание движения курсора мыши в реальном времени с выводом динамических стилей inline CSS-переменных, дополненное фоновой прицельной сеткой.',
      hasControls: true,
      code: `/* CSS Module & Mouse Tracker */
.crosshairContainer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

.crosshairX {
  position: absolute;
  left: 0; right: 0;
  height: 1px;
  background: rgba(26, 115, 232, 0.15);
  pointer-events: none;
  z-index: 2;
}

.crosshairY {
  position: absolute;
  top: 0; bottom: 0;
  width: 1px;
  background: rgba(26, 115, 232, 0.15);
  pointer-events: none;
  z-index: 2;
}

.crosshairCoords {
  position: absolute;
  background: var(--text-primary);
  color: #ffffff;
  font-family: var(--font-tech);
  font-size: 0.65rem;
  padding: 4px 8px;
  border-radius: 6px;
  pointer-events: none;
  z-index: 3;
  transform: translate(12px, 12px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
}`
    },
    {
      id: 'svgPath',
      badge: 'Векторная графика: Анимация',
      title: 'Анимированная отрисовка векторных связей',
      description: 'Динамические линии передач данных и связей между объектами WAG, плавно "прорисовывающие" себя по сложной кривой Безье с пульсирующими узлами.',
      principles: 'Использует свойства stroke-dasharray и stroke-dashoffset для имитации рисования кистью по контуру, сохраняя идеальную векторизацию в любом разрешении.',
      hasControls: true,
      code: `/* CSS Module & SVG Connections */
.svgPathContainer {
  width: 280px;
  height: 180px;
}

.svgPathDraw {
  stroke-dasharray: 400;
  stroke-dashoffset: 400;
  animation: svgPathAnim 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
}

@keyframes svgPathAnim {
  0% { stroke-dashoffset: 400; opacity: 0.2; }
  35% { opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 1; }
}

.svgNodePulse {
  animation: svgNodePulseAnim 2s infinite alternate;
}

@keyframes svgNodePulseAnim {
  0% { r: 3; opacity: 0.7; }
  100% { r: 6; opacity: 1; }
}`
    },
    {
      id: 'floatSlow',
      badge: 'Композиция: Левитация',
      title: 'Плавная левитация инженерного блока',
      description: 'Эффект парения в воздухе для ключевых схем и изометрических 3D-чертежей, создающий иллюзию невесомости и технологичной воздушности.',
      principles: 'Медленные гармонические колебания по синусоиде с микро-поворотами на 2 градуса. Снижает статичность макета и привлекает внимание к фокусным блокам.',
      hasControls: true,
      code: `/* CSS Module */
.floatingHeroBlock {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  border: 1px solid var(--border-gold);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  animation: floatSlow-demo 6s ease-in-out infinite alternate;
}

.floatingHeroBlock::before {
  content: 'WAG';
  font-family: var(--font-tech);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: 0.1em;
}

@keyframes floatSlow-demo {
  0% { transform: translateY(-8px) rotate(2deg); }
  100% { transform: translateY(8px) rotate(-2deg); }
}`
    }
  ];

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  // Helper to colorize the code snippet for high-fidelity presentation
  const renderColoredCode = (code: string) => {
    const lines = code.split('\n');
    return lines.map((line, idx) => {
      if (line.trim().startsWith('/*')) {
        return <div key={idx} className={styles.comment}>{line}</div>;
      }
      if (line.includes('{') || line.includes('}')) {
        // Highlight selector
        if (line.includes('{')) {
          const parts = line.split('{');
          return (
            <div key={idx}>
              <span className={styles.selector}>{parts[0]}</span>
              <span>{'{'}</span>
            </div>
          );
        }
        return <div key={idx}>{'}'}</div>;
      }
      // Highlight property: value
      if (line.includes(':')) {
        const parts = line.split(':');
        return (
          <div key={idx} style={{ paddingLeft: '20px' }}>
            <span className={styles.property}>{parts[0]}</span>
            <span>:</span>
            <span className={styles.value}>{parts[1]}</span>
          </div>
        );
      }
      return <div key={idx} style={{ paddingLeft: line.startsWith(' ') ? '20px' : '0' }}>{line}</div>;
    });
  };

  const selectedEffect = effectsList.find(e => e.id === activeTab) || effectsList[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y, active: true });
  };

  const handleMouseLeave = () => {
    setMousePos(prev => ({ ...prev, active: false }));
  };

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Вернуться на главную
        </Link>
        <h1 className={styles.title}>WAG Effects & UI Kit Playground</h1>
        <p className={styles.subtitle}>Интерактивная витрина интерфейсных эффектов дизайн-системы Google Antigravity Light. Исследуйте живую визуализацию элементов и копируйте их оптимизированный CSS-код.</p>
        <Link href="/effects/3d" className={styles.backLink} style={{ marginTop: 16 }}>
          ⤴ 3D Playground (WebGL / R3F)
        </Link>
      </div>

      <div className={styles.layout}>
        {/* Sidebar Navigation */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTitle}>Каталог Эффектов</div>
          <nav className={styles.tabList}>
            {effectsList.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              >
                {tab.id === 'cards' && '🎴 Стеклянная карточка'}
                {tab.id === 'buttons' && '🖱️ Микро-кнопки'}
                {tab.id === 'pings' && '🟢 Маяк статуса'}
                {tab.id === 'glow' && '🔆 Световой Glow'}
                {tab.id === 'grids' && '📐 Чертежная сетка'}
                {tab.id === 'logo3D' && '💫 3D Орбита Лого'}
                {tab.id === 'crosshair' && '🎯 Прицел Координат'}
                {tab.id === 'svgPath' && '✏️ Отрисовка Связей'}
                {tab.id === 'floatSlow' && '🪶 Парящий Блок'}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className={styles.mainCard}>
          <div className={styles.cardHeader}>
            <span className={styles.effectBadge}>{selectedEffect.badge}</span>
            <h2 className={styles.effectTitle}>{selectedEffect.title}</h2>
            <p className={styles.effectDesc}>{selectedEffect.description}</p>
          </div>

          <div className={styles.split}>
            {/* Left Column: Interactive Live Preview */}
            <div className={styles.previewSide}>
              <div className={styles.sectionHeading}>Живая визуализация (Интерактивно)</div>
              
              <div className={styles.viewport}>
                
                {/* 1. Glass Card Preview */}
                {selectedEffect.id === 'cards' && (
                  <div className={styles.glassCardDemo}>
                    <div className={styles.iconWrapper}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                      </svg>
                    </div>
                    <h3 className={styles.cardTitle}>Геодезические изыскания</h3>
                    <p className={styles.cardText}>Высокоточное лазерное и тахеометрическое сканирование местности с созданием 3D цифровых моделей.</p>
                  </div>
                )}

                {/* 2. Buttons Preview */}
                {selectedEffect.id === 'buttons' && (
                  <div className={styles.buttonDemoBox}>
                    <button className={styles.btnPrimary}>
                      Заказать расчет
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                    
                    <button className={styles.btnOutline}>
                      Подробнее о компании
                    </button>
                  </div>
                )}

                {/* 3. Ping Indicator Preview */}
                {selectedEffect.id === 'pings' && (
                  <div className={styles.pingWrapper}>
                    <div className={`${styles.pingNode} ${pingColor === 'gold' ? styles.pingGold : ''}`}>
                      <div className={styles.pingCore}></div>
                      <div className={`${styles.pingRing} ${pingSpeed === 'fast' ? styles.pingSpeed : ''}`}></div>
                    </div>
                    <span className={styles.pingLabel}>
                      {pingColor === 'teal' ? 'СИСТЕМА: СВЯЗЬ АКТИВНА' : 'БД: СИНХРОНИЗАЦИЯ'}
                    </span>
                  </div>
                )}

                {/* 4. Glow Spotlights Preview */}
                {selectedEffect.id === 'glow' && (
                  <div className={styles.glowDemoWrapper}>
                    {glowActive && (
                      <>
                        <div className={styles.glowBlob}></div>
                        <div className={`${styles.glowBlob} ${styles.glowBlobSecond}`}></div>
                      </>
                    )}
                    <div className={styles.glowGlassContainer}>
                      <h4>Световой прожектор</h4>
                      <p>Две размытые дрейфующие полусферы создают мягкий световой объем позади контента.</p>
                    </div>
                  </div>
                )}

                {/* 5. Blueprint Grid Preview */}
                {selectedEffect.id === 'grids' && (
                  <div className={styles.blueprintViewport}>
                    <div className={styles.blueprintLines}></div>
                    <div className={styles.movingStripe} style={{ animationDuration: stripeSpeed === 'slow' ? '12s' : '6s' }}></div>
                    <div className={styles.coordNode}>
                      <span className={styles.coordLabel}>N = 43°15&apos;31&quot;</span>
                      <span className={styles.coordLabel}>E = 76°54&apos;12&quot;</span>
                    </div>
                  </div>
                )}

                {/* 6. 3D Logo Orbit Preview */}
                {selectedEffect.id === 'logo3D' && (
                  <div className={styles.logo3DWrapper}>
                    <div 
                      className={styles.logo3D}
                      style={{ animationDuration: logoSpeed === 'fast' ? '3s' : logoSpeed === 'slow' ? '20s' : '10s' }}
                    >
                      <svg width="90" height="90" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="45" stroke="var(--border-gold)" strokeWidth="1.5" strokeDasharray="4 4" />
                        <rect x="30" y="30" width="40" height="40" rx="10" fill="var(--gold-glow)" stroke="var(--gold)" strokeWidth="2" />
                        <path d="M40 50L47 57L60 44" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="50" cy="50" r="4" fill="var(--teal)" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* 7. Map Crosshair Preview */}
                {selectedEffect.id === 'crosshair' && (
                  <div 
                    className={styles.crosshairContainer}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onMouseEnter={() => setMousePos(prev => ({ ...prev, active: true }))}
                  >
                    <div className={styles.blueprintLines} style={{ opacity: 0.3 }}></div>
                    {mousePos.active && (
                      <>
                        <div className={styles.crosshairX} style={{ top: `${mousePos.y}px` }}></div>
                        <div className={styles.crosshairY} style={{ left: `${mousePos.x}px` }}></div>
                        <div 
                          className={styles.crosshairCoords} 
                          style={{ 
                            left: `${Math.min(mousePos.x, 150)}px`, 
                            top: `${Math.min(mousePos.y, 230)}px` 
                          }}
                        >
                          LAT: {(43.258 + mousePos.y / 10000).toFixed(5)}°N<br/>
                          LNG: {(76.903 + mousePos.x / 10000).toFixed(5)}°E
                        </div>
                      </>
                    )}
                    <div style={{ zIndex: 1, pointerEvents: 'none', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0 20px' }}>
                      Двигайте курсор внутри этой области для сканирования географических координат
                    </div>
                  </div>
                )}

                {/* 8. Self-Drawing SVG Connections Preview */}
                {selectedEffect.id === 'svgPath' && (
                  <div className={styles.svgPathContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 280 180" fill="none" style={{ width: '100%', height: '100%' }}>
                      <line x1="20" y1="90" x2="260" y2="90" stroke="var(--glass-border)" strokeWidth="1" strokeDasharray="4 6" />
                      <path 
                        className={styles.svgPathDraw} 
                        d="M 30,90 C 80,30 120,150 170,90 C 200,60 220,90 250,90" 
                        stroke="var(--gold)" 
                        strokeWidth={pathStroke}
                        strokeLinecap="round" 
                      />
                      <circle cx="30" cy="90" r="5" fill="var(--text-primary)" />
                      <circle className={styles.svgNodePulse} cx="135" cy="95" r="4" fill="var(--teal)" />
                      <circle cx="250" cy="90" r="5" fill="var(--text-primary)" />
                    </svg>
                  </div>
                )}

                {/* 9. Floating Engineering Block Preview */}
                {selectedEffect.id === 'floatSlow' && (
                  <div 
                    className={styles.floatingHeroBlock}
                    style={{ animationDuration: floatSpeed === 'fast' ? '2s' : '6s' }}
                  >
                    <div style={{ position: 'absolute', inset: '10px', border: '1px dashed var(--border-gold)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-tech)', color: 'var(--gold)', fontWeight: 'bold' }}>ENGINEERING</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>VERSION 4.20</span>
                    </div>
                  </div>
                )}

              </div>

              {/* Dynamic Interactive Controls */}
              {selectedEffect.hasControls && (
                <div style={{ marginTop: '10px' }}>
                  <div className={styles.sectionHeading}>Параметры демонстрации</div>
                  <div className={styles.principlesBox} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    
                    {/* Controls for Ping Indicator */}
                    {selectedEffect.id === 'pings' && (
                      <>
                        <button className={styles.copyBtn} onClick={() => setPingColor(p => p === 'teal' ? 'gold' : 'teal')}>
                          Цвет: {pingColor === 'teal' ? 'Теал' : 'Роял Блю'}
                        </button>
                        <button className={styles.copyBtn} onClick={() => setPingSpeed(s => s === 'normal' ? 'fast' : 'normal')}>
                          Скорость: {pingSpeed === 'normal' ? '2.0с' : '0.9с'}
                        </button>
                      </>
                    )}

                    {/* Controls for Glow Spotlights */}
                    {selectedEffect.id === 'glow' && (
                      <button className={styles.copyBtn} onClick={() => setGlowActive(g => !g)}>
                        Состояние: {glowActive ? 'Включено' : 'Выключено'}
                      </button>
                    )}

                    {/* Controls for Blueprint Grid */}
                    {selectedEffect.id === 'grids' && (
                      <button className={styles.copyBtn} onClick={() => setStripeSpeed(s => s === 'normal' ? 'slow' : 'normal')}>
                        Скорость сканирования: {stripeSpeed === 'normal' ? 'Нормальная' : 'Медленная'}
                      </button>
                    )}

                    {/* Controls for 3D Logo Orbit */}
                    {selectedEffect.id === 'logo3D' && (
                      <button className={styles.copyBtn} onClick={() => setLogoSpeed(s => s === 'normal' ? 'fast' : s === 'fast' ? 'slow' : 'normal')}>
                        Скорость орбиты: {logoSpeed === 'normal' ? 'Средняя (10с)' : logoSpeed === 'fast' ? 'Быстрая (3с)' : 'Медленная (20с)'}
                      </button>
                    )}

                    {/* Controls for Map Crosshair */}
                    {selectedEffect.id === 'crosshair' && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', height: '32px', padding: '0 8px' }}>
                        {mousePos.active 
                          ? `Прицел нацелен: X: ${Math.round(mousePos.x)}px, Y: ${Math.round(mousePos.y)}px`
                          : 'Наведите мышь на экран для прицела'
                        }
                      </span>
                    )}

                    {/* Controls for Self-Drawing Connections */}
                    {selectedEffect.id === 'svgPath' && (
                      <button className={styles.copyBtn} onClick={() => setPathStroke(s => s === 2.5 ? 4.5 : s === 4.5 ? 1.5 : 2.5)}>
                        Толщина связи: {pathStroke}px
                      </button>
                    )}

                    {/* Controls for Floating Engineering Block */}
                    {selectedEffect.id === 'floatSlow' && (
                      <button className={styles.copyBtn} onClick={() => setFloatSpeed(s => s === 'normal' ? 'fast' : 'normal')}>
                        Амплитуда колебаний: {floatSpeed === 'normal' ? 'Плавная (6с)' : 'Быстрая (2с)'}
                      </button>
                    )}

                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Code Display & Explanations */}
            <div className={styles.codeSide}>
              <div className={styles.codeBlockHeader}>
                <span className={styles.codeBlockTitle}>Оптимизированный CSS-код</span>
                <button
                  onClick={() => handleCopyCode(selectedEffect.id, selectedEffect.code)}
                  className={`${styles.copyBtn} ${copiedStates[selectedEffect.id] ? styles.copyBtnSuccess : ''}`}
                >
                  {copiedStates[selectedEffect.id] ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Скопировано!
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      Копировать код
                    </>
                  )}
                </button>
              </div>

              <pre className={styles.editor}>
                <code>
                  {renderColoredCode(selectedEffect.code)}
                </code>
              </pre>

              <div className={styles.principlesBox}>
                <div className={styles.principlesTitle}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gold)' }}>
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                  Правила UX-анимации
                </div>
                <p className={styles.principlesText}>{selectedEffect.principles}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
