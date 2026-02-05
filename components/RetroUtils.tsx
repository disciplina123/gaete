import React, { useState } from 'react';

// --- PALETAS DE CORES ---

// 1. Super Mario World (Original/Classic)
const MARIO_COLORS = {
  ui: {
    background: '#FFFFCE', // Original Message Box Cream
    border: '#000000',
    shadow: 'rgba(0,0,0,0.5)',
    text: '#000000',
  },
  red: { main: '#E63939', light: '#FF6666', dark: '#AA0000', text: '#FFFFFF' },
  vibrantRed: { main: '#FF4444', light: '#FF8888', dark: '#CC0000', text: '#FFFFFF' },
  blue: { main: '#4080FF', light: '#70A0FF', dark: '#0040B0', text: '#FFFFFF' },
  yellow: { main: '#F8D878', light: '#FFF090', dark: '#B89830', text: '#000000' }, // Cabeçalhos padrão
  green: { main: '#20D040', light: '#60FF80', dark: '#008020', text: '#FFFFFF' },
  purple: { main: '#9940FF', light: '#C080FF', dark: '#6000B0', text: '#FFFFFF' },
  gray: { main: '#A0A0A0', light: '#D0D0D0', dark: '#606060', text: '#FFFFFF' },
  white: { main: '#FFFFFF', light: '#FFFFFF', dark: '#E0E0E0', text: '#000000' },
  black: { main: '#202020', light: '#404040', dark: '#000000', text: '#FFFFFF' },
  orange: { main: '#FF9020', light: '#FFC050', dark: '#CC6000', text: '#FFFFFF' }
};

// 2. Minimalist Mode
const MINIMALIST_COLORS = {
  ui: {
    background: '#000000',
    border: '#FFFFFF',
    shadow: '4px 4px 0px #FFFFFF',
    text: '#FFFFFF',
  },
  red: { main: '#000000', light: '#000000', dark: '#000000', text: '#FFFFFF' },
  vibrantRed: { main: '#000000', light: '#000000', dark: '#000000', text: '#FFFFFF' },
  blue: { main: '#000000', light: '#000000', dark: '#000000', text: '#FFFFFF' },
  yellow: { main: '#000000', light: '#000000', dark: '#000000', text: '#FFFFFF' },
  green: { main: '#000000', light: '#000000', dark: '#000000', text: '#FFFFFF' },
  purple: { main: '#000000', light: '#000000', dark: '#000000', text: '#FFFFFF' },
  gray: { main: '#000000', light: '#000000', dark: '#000000', text: '#FFFFFF' },
  white: { main: '#FFFFFF', light: '#FFFFFF', dark: '#FFFFFF', text: '#000000' },
  black: { main: '#000000', light: '#000000', dark: '#000000', text: '#FFFFFF' },
  orange: { main: '#000000', light: '#000000', dark: '#000000', text: '#FFFFFF' }
};

// 3. Neutral Mode (Retro OS / Productivity Grey)
const NEUTRAL_COLORS = {
  ui: {
    background: '#E0E0E0', // Classic Windows/Mac Gray
    border: '#404040',
    shadow: '4px 4px 0px rgba(0,0,0,0.2)',
    text: '#202020',
  },
  // Desaturated, soft tones
  red: { main: '#B08080', light: '#D0A0A0', dark: '#906060', text: '#FFF' }, 
  vibrantRed: { main: '#C07070', light: '#E09090', dark: '#A05050', text: '#FFF' },
  blue: { main: '#8090B0', light: '#A0B0D0', dark: '#607090', text: '#FFF' },
  yellow: { main: '#C0C0C0', light: '#D0D0D0', dark: '#A0A0A0', text: '#000' }, // Standard Grey Header
  green: { main: '#90B090', light: '#B0D0B0', dark: '#709070', text: '#FFF' },
  purple: { main: '#A090B0', light: '#C0B0D0', dark: '#807090', text: '#FFF' },
  gray: { main: '#A0A0A0', light: '#C0C0C0', dark: '#808080', text: '#FFF' },
  white: { main: '#F5F5F5', light: '#FFFFFF', dark: '#E0E0E0', text: '#000' },
  black: { main: '#303030', light: '#505050', dark: '#101010', text: '#FFF' },
  orange: { main: '#C0A080', light: '#E0C0A0', dark: '#A08060', text: '#FFF' }
};

// 4. Neutral Warm Palette (Tons quentes e acolhedores)
const NEUTRAL_WARM_COLORS = {
  ui: {
    background: '#E8DDD0', // Bege/Creme quente
    border: '#5C4A3A',
    shadow: '4px 4px 0px rgba(92,74,58,0.25)',
    text: '#3A2F25',
  },
  red: { main: '#C88A7A', light: '#E0B0A0', dark: '#A86050', text: '#FFF' },
  vibrantRed: { main: '#D87060', light: '#F09080', dark: '#B85040', text: '#FFF' },
  blue: { main: '#8DA0B0', light: '#B0C5D5', dark: '#6D8090', text: '#FFF' },
  yellow: { main: '#D4C4A8', light: '#E8D8BC', dark: '#B0A088', text: '#3A2F25' },
  green: { main: '#A0B090', light: '#C0D0B0', dark: '#809070', text: '#FFF' },
  purple: { main: '#B09AA8', light: '#D0BAC8', dark: '#907A88', text: '#FFF' },
  gray: { main: '#B0A090', light: '#D0C0B0', dark: '#908070', text: '#3A2F25' },
  white: { main: '#FAF5F0', light: '#FFFFFF', dark: '#E8DDD0', text: '#3A2F25' },
  black: { main: '#3A2F25', light: '#5C4A3A', dark: '#1A1510', text: '#FFF' },
  orange: { main: '#D0A070', light: '#F0C090', dark: '#B08050', text: '#FFF' }
};

// 5. Neutral Cool Palette (Tons frios e modernos)
const NEUTRAL_COOL_COLORS = {
  ui: {
    background: '#D8E0E8', // Azul-acinzentado claro
    border: '#3A4A5C',
    shadow: '4px 4px 0px rgba(58,74,92,0.25)',
    text: '#1F2A35',
  },
  red: { main: '#A08090', light: '#C0A0B0', dark: '#806070', text: '#FFF' },
  vibrantRed: { main: '#B07080', light: '#D090A0', dark: '#905060', text: '#FFF' },
  blue: { main: '#7090B0', light: '#90B0D0', dark: '#507090', text: '#FFF' },
  yellow: { main: '#B0C0D0', light: '#D0E0F0', dark: '#90A0B0', text: '#1F2A35' },
  green: { main: '#80A0A0', light: '#A0C0C0', dark: '#608080', text: '#FFF' },
  purple: { main: '#9090B0', light: '#B0B0D0', dark: '#707090', text: '#FFF' },
  gray: { main: '#90A0B0', light: '#B0C0D0', dark: '#708090', text: '#FFF' },
  white: { main: '#F0F5FA', light: '#FFFFFF', dark: '#D8E0E8', text: '#1F2A35' },
  black: { main: '#1F2A35', light: '#3A4A5C', dark: '#0A1520', text: '#FFF' },
  orange: { main: '#A0A090', light: '#C0C0B0', dark: '#808070', text: '#FFF' }
};

// 6. Neutral Dark Palette (Modo escuro neutro)
const NEUTRAL_DARK_COLORS = {
  ui: {
    background: '#1A1A1A', // Cinza muito escuro
    border: '#404040',
    shadow: '4px 4px 0px rgba(0,0,0,0.5)',
    text: '#E0E0E0',
  },
  red: { main: '#C07070', light: '#E09090', dark: '#A05050', text: '#FFF' },
  vibrantRed: { main: '#D08080', light: '#F0A0A0', dark: '#B06060', text: '#FFF' },
  blue: { main: '#7090B0', light: '#90B0D0', dark: '#507090', text: '#FFF' },
  yellow: { main: '#B0B0B0', light: '#D0D0D0', dark: '#909090', text: '#1A1A1A' },
  green: { main: '#80B080', light: '#A0D0A0', dark: '#609060', text: '#FFF' },
  purple: { main: '#A080B0', light: '#C0A0D0', dark: '#806090', text: '#FFF' },
  gray: { main: '#808080', light: '#A0A0A0', dark: '#606060', text: '#FFF' },
  white: { main: '#E0E0E0', light: '#F5F5F5', dark: '#C0C0C0', text: '#1A1A1A' },
  black: { main: '#2A2A2A', light: '#404040', dark: '#0A0A0A', text: '#E0E0E0' },
  orange: { main: '#C09060', light: '#E0B080', dark: '#A07040', text: '#FFF' }
};


export const THEME = {
  font: '"Press Start 2P", cursive',
  fonts: {
    pixel: '"Press Start 2P", cursive',
  },
  shadow: '4px 4px 0px rgba(0,0,0,0.5)',
  shadowHover: '2px 2px 0px rgba(0,0,0,0.5)',
  shadowActive: '0px 0px 0px rgba(0,0,0,0.0)',
  // Default fallback (Mario)
  colors: MARIO_COLORS 
};

// Helper to get colors based on theme mode
export const getThemeColors = (mode: 'mario' | 'minimalist' | 'neutral', neutralPalette?: 'classic' | 'warm' | 'cool' | 'dark') => {
  if (mode === 'minimalist') return MINIMALIST_COLORS;
  if (mode === 'neutral') {
    if (neutralPalette === 'warm') return NEUTRAL_WARM_COLORS;
    if (neutralPalette === 'cool') return NEUTRAL_COOL_COLORS;
    if (neutralPalette === 'dark') return NEUTRAL_DARK_COLORS;
    return NEUTRAL_COLORS;
  }
  return MARIO_COLORS;
};

// --- PRESETS DE BACKGROUND (GIFS PIXEL ART LANDSCAPES) ---
export const BACKGROUND_PRESETS = [
  { id: 'mario-dynamic', name: '1', url: '' }, // Canvas padrão
  { id: 'alpine-peaks', name: '2', url: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExanM2bjR4eGRzejV3ZTAzY2Q2dDM5Y2diZ2hpZGdsMDFnb2FoYjk0ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/N3yLGQ1oMYfGU/giphy.gif' }, // Montanhas pixeladas
  { id: 'sunset-city', name: '3', url: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3lrbDBzZnFyeTRoeGI1d2diOG01cGp3eDB1YjZteHN2cTVnd3B5dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l378a5wVtWNHaDrlS/giphy.gif' }, // Cidade cyberpunk/retro
  { id: 'mystic-forest', name: '4', url: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnRkd2JiZnVjaHptNDIzM2w5MjF1M204Zmo5a2E1b2p0cTJsdTBkMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9B7XwCQZRQfQs/giphy.gif' }, // Floresta densa
  { id: 'ocean-view', name: '5', url: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExanQ0aTB6cmNqbzRzbG9vYjR2Y3FkYTEyNm9icXVud2Y4aXV4NXo1MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3og0ICnG2pLn8NSrRu/giphy.gif' }, // Mar calmo
  { id: 'cloud-kingdom', name: '6', url: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjFpMms0cjZ3bGIycGIxdHJzZ21zOXcwbm44bm1xMjlqYmx5bmZ1bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VjI9yldoeRyTK/giphy.gif' }, // Nuvens Ghibli style
  { id: 'rainy-street', name: '7', url: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWFsMjg3OWFyYnhjZXdzbnFlcm0yOThrMzNraHUybnE2Ym1vM2Z1YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ztpMY1t5VYWlO/giphy.gif' }, // Rua com chuva
  { id: 'train-journey', name: '88', url: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif' } // Viagem de trem (paisagem passando)
];

// --- ESTADO GLOBAL DE MUTE ---
let isGlobalMuted = false;

export const toggleGlobalMute = () => {
  isGlobalMuted = !isGlobalMuted;
  return isGlobalMuted;
};

export const getMuteState = () => isGlobalMuted;

// --- SISTEMA DE ÁUDIO 8-BIT ---
export const play8BitSound = (type: 'hover' | 'coin' | 'pipe' | 'alarm' | 'click' | 'open' | 'add' | 'jump' | 'powerup' | '1up' | 'pause' | 'stomp' | 'fireball' | 'break' | 'hurt') => {
  if (isGlobalMuted) return;

  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  if (type === 'hover') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  } 
  else if (type === 'click') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  }
  else if (type === 'jump') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
  }
  else if (type === 'powerup') {
    const freqs = [1046.5, 1174.7, 1318.5, 1568, 2093, 2349.3, 2637, 3136];
    freqs.forEach((freq, i) => {
      const time = now + (i * 0.08);
      const oscN = ctx.createOscillator();
      const gainN = ctx.createGain();
      oscN.type = 'square';
      oscN.connect(gainN);
      gainN.connect(ctx.destination);
      oscN.frequency.setValueAtTime(freq, time);
      gainN.gain.setValueAtTime(0.08, time);
      gainN.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
      oscN.start(time);
      oscN.stop(time + 0.1);
    });
    return; 
  }
  else if (type === '1up') {
    const melody = [659.25, 783.99, 1046.50, 783.99, 1046.50, 1318.51];
    melody.forEach((freq, i) => {
      const time = now + (i * 0.12);
      const oscN = ctx.createOscillator();
      const gainN = ctx.createGain();
      oscN.type = 'square';
      oscN.connect(gainN);
      gainN.connect(ctx.destination);
      oscN.frequency.setValueAtTime(freq, time);
      gainN.gain.setValueAtTime(0.1, time);
      gainN.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
      oscN.start(time);
      oscN.stop(time + 0.15);
    });
    return;
  }
  else if (type === 'pause') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(587.33, now + 0.15);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  }
  else if (type === 'stomp') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  }
  else if (type === 'fireball') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  }
  else if (type === 'break') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
  }
  else if (type === 'open') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, now); 
    osc.frequency.linearRampToValueAtTime(880, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  }
  else if (type === 'add') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now); 
    osc.frequency.linearRampToValueAtTime(660, now + 0.15); 
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
  }
  else if (type === 'coin') {
    osc.type = 'sine'; 
    osc.frequency.setValueAtTime(784, now); 
    osc.frequency.setValueAtTime(988, now + 0.08); 
    osc.frequency.setValueAtTime(1175, now + 0.16); 
    gain.gain.setValueAtTime(0.08, now); 
    gain.gain.setValueAtTime(0.08, now + 0.16);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  } 
  else if (type === 'pipe') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.3);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  }
  else if (type === 'alarm') {
    osc.type = 'square';
    [880, 1174, 1760, 880, 1174, 1760].forEach((freq, i) => {
        const time = now + (i * 0.15);
        const oscN = ctx.createOscillator();
        const gainN = ctx.createGain();
        oscN.type = 'square';
        oscN.connect(gainN);
        gainN.connect(ctx.destination);
        oscN.frequency.setValueAtTime(freq, time);
        gainN.gain.setValueAtTime(0.1, time);
        gainN.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        oscN.start(time);
        oscN.stop(time + 0.12);
    });
  }
  else if (type === 'hurt') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(523, now); 
    osc.frequency.exponentialRampToValueAtTime(196, now + 0.3); 
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  }
};

// --- COMPONENTE DE BOTÃO RETRO ---
interface RetroButtonProps {
  onClick?: (e: any) => void;
  colorType?: 'red' | 'blue' | 'yellow' | 'green' | 'purple' | 'gray' | 'white' | 'black' | 'orange' | 'vibrantRed';
  size?: 'sm' | 'small' | 'md' | 'lg' | 'icon';
  children?: React.ReactNode;
  title?: string;
  sound?: string;
  className?: string;
  as?: any;
  themeMode?: 'mario' | 'minimalist' | 'neutral';
  neutralPalette?: 'classic' | 'warm' | 'cool';
}

export const RetroButton = ({ 
  onClick, 
  colorType = 'yellow', 
  size = 'md', 
  children, 
  title, 
  sound = 'click', 
  className = '', 
  as = 'button',
  themeMode = 'mario',
  neutralPalette = 'classic'
}: RetroButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsActive(false);
  };

  const handleMouseDown = () => {
    setIsActive(true);
  };

  const handleMouseUp = () => {
    setIsActive(false);
  };

  const handleClick = (e: any) => {
      play8BitSound(sound as any);
      if(onClick) onClick(e);
  }

  // Get colors based on current theme mode
  const currentPalette = getThemeColors(themeMode, neutralPalette);
  // @ts-ignore
  const selectedColor = currentPalette[colorType];
  const c = (selectedColor && 'main' in selectedColor) ? selectedColor : currentPalette.yellow;

  const dims = size === 'sm' ? 'w-20 h-10 text-[10px]' 
             : size === 'small' ? 'px-4 py-2 text-[10px]'
             : size === 'md' ? 'w-32 h-14 text-xs' 
             : size === 'lg' ? 'w-60 h-16 text-xl' 
             : size === 'icon' ? 'w-14 h-14 text-2xl'
             : 'w-32 h-14 text-xs';

  const isMinimalist = themeMode === 'minimalist';
  const isNeutral = themeMode === 'neutral';

  const currentShadow = isActive 
    ? THEME.shadowActive 
    : isHovered 
      ? THEME.shadowHover 
      : isMinimalist 
        ? '4px 4px 0 #FFFFFF' 
        : (isNeutral ? '4px 4px 0 rgba(0,0,0,0.1)' : THEME.shadow); 

  const Component = as;

  const bgColor = isMinimalist && isHovered ? '#FFFFFF' : c.main;
  const textColor = isMinimalist && isHovered ? '#000000' : c.text;
  const borderColor = isMinimalist ? '#FFFFFF' : (isNeutral ? '#404040' : '#000');

  return (
    <Component
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      title={title}
      className={`
        relative group transition-all duration-100 ease-out
        hover:-translate-y-1 active:translate-y-1
        flex items-center justify-center
        cursor-pointer
        ${dims}
        ${className}
      `}
      style={{
        fontFamily: THEME.font,
        border: `4px solid ${borderColor}`,
        backgroundColor: bgColor,
        // Linear gradient for 3D button effect (simplified for minimalist, flat for neutral)
        backgroundImage: isMinimalist || isNeutral
          ? 'none' 
          : `linear-gradient(to bottom, ${c.light} 0%, ${c.main} 40%, ${c.main} 100%)`,
        boxShadow: currentShadow,
        color: textColor,
        textShadow: (isMinimalist || isNeutral || colorType === 'yellow') ? 'none' : '2px 2px 0px #000',
      }}
    >
      {!isMinimalist && !isNeutral && (
        <>
          <div className="absolute inset-0 pointer-events-none border-t-4 border-l-4 border-white opacity-40" />
          <div className="absolute inset-0 pointer-events-none border-b-4 border-r-4 border-black opacity-20" />
        </>
      )}
      <span className="relative z-10 filter drop-shadow-md text-center leading-tight uppercase tracking-wider">{children}</span>
    </Component>
  );
};