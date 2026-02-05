import React, { useState, useEffect } from 'react';
import SuperMarioBackground from './components/SuperMarioBackground';
import MinimalistBackground from './components/MinimalistBackground';
import ImageBackground from './components/ImageBackground';
import DarkNeutralBackground from './components/DarkNeutralBackground';
import PixelTimer from './components/PixelTimer';
import StudyMaterials, { Subject } from './components/StudyMaterials';
import StudyCalendar from './components/StudyCalendar';
import StudyStatus from './components/StudyStatus';
import Agenda from './components/Agenda';
import MusicPlayer from './components/MusicPlayer';
import Settings from './components/Settings';
import Achievements from './components/Achievements';
import { RetroButton, play8BitSound, BACKGROUND_PRESETS } from './components/RetroUtils';
import { loadAchievements, isFeatureUnlocked } from './components/AchievementSystem';

type ViewType = 'timer' | 'materials' | 'calendar' | 'agenda' | 'status' | 'settings' | 'achievements';
export type ThemeMode = 'mario' | 'minimalist' | 'neutral';

// Definição dos ícones do menu
const MENU_ITEMS = [
  { 
    id: 'timer' as ViewType, 
    title: 'Timer', 
    colorType: 'vibrantRed' as const,
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      {/* Ampulheta Pixelada */}
      {/* Topo */}
      <rect x="7" y="4" width="10" height="2" fill="currentColor"/>
      {/* Parte superior do corpo */}
      <rect x="8" y="6" width="8" height="1" fill="currentColor"/>
      <rect x="9" y="7" width="6" height="1" fill="currentColor"/>
      <rect x="10" y="8" width="4" height="1" fill="currentColor"/>
      {/* Centro (estreito) */}
      <rect x="11" y="9" width="2" height="2" fill="currentColor"/>
      <rect x="11" y="13" width="2" height="2" fill="currentColor"/>
      {/* Parte inferior do corpo */}
      <rect x="10" y="15" width="4" height="1" fill="currentColor"/>
      <rect x="9" y="16" width="6" height="1" fill="currentColor"/>
      <rect x="8" y="17" width="8" height="1" fill="currentColor"/>
      {/* Base */}
      <rect x="7" y="18" width="10" height="2" fill="currentColor"/>
      {/* Areia caindo */}
      <rect x="11" y="11" width="2" height="2" fill="currentColor" opacity="0.5"/>
    </svg>
  },
  { 
    id: 'materials' as ViewType, 
    title: 'Materials', 
    colorType: 'blue' as const,
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M3 5H11V21H3V5ZM5 7H9V19H5V7ZM13 5H21V21H13V5ZM15 7H19V19H15V7Z" />
    </svg>
  },
  { 
    id: 'calendar' as ViewType, 
    title: 'Calendar', 
    colorType: 'green' as const,
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M5 4H19V20H5V4ZM7 2V5H9V2H7ZM15 2V5H17V2H15ZM7 8H17V18H7V8ZM9 10H11V12H9V10ZM13 10H15V12H13V10ZM9 14H11V16H9V14ZM13 14H15V16H13V14Z" />
    </svg>
  },
  { 
    id: 'agenda' as ViewType, 
    title: 'Agenda', 
    colorType: 'orange' as const,
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M8 2H16V4H8V2ZM6 6H18V20H6V6ZM8 8H16V10H8V8ZM8 12H16V14H8V12ZM8 16H13V18H8V16Z" />
    </svg>
  },
  { 
    id: 'status' as ViewType, 
    title: 'Status', 
    colorType: 'yellow' as const,
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M3 20H21V22H3V20ZM5 14H9V19H5V14ZM11 10H15V19H11V10ZM17 6H21V19H17V6Z" />
    </svg>
  },
  { 
    id: 'settings' as ViewType, 
    title: 'Settings', 
    colorType: 'purple' as const,
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M10 2H14V6H10V2ZM14 6H18V10H14V6ZM18 10H22V14H18V10ZM18 14H14V18H18V14ZM14 18H10V22H14V18ZM10 18H6V14H10V18ZM6 14H2V10H6V14ZM6 10H10V6H6V10ZM10 10H14V14H10V10Z" />
    </svg>
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('timer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // --- STATE: ACHIEVEMENTS ---
  const [achievements, setAchievements] = useState(() => loadAchievements());
  
  // --- STATE: SUBJECTS ---
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('subjects');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('subjects', JSON.stringify(subjects));
  }, [subjects]);

  // --- STATE: SETTINGS ---
  const [autoTimeMode, setAutoTimeMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('autoTimeMode');
    return saved !== null ? saved === 'true' : false;
  });

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode');
    // @ts-ignore
    return (saved === 'minimalist' || saved === 'neutral') ? saved : 'mario';
  });

  const [neutralPalette, setNeutralPalette] = useState<'classic' | 'warm' | 'cool' | 'dark'>(() => {
    const saved = localStorage.getItem('neutralPalette');
    return (saved === 'warm' || saved === 'cool' || saved === 'dark') ? saved : 'classic';
  });

  const [activeBackground, setActiveBackground] = useState<string>(() => {
    return localStorage.getItem('activeBackground') || 'mario-dynamic';
  });

  const [timerPosition, setTimerPosition] = useState<'center' | 'top-left' | 'bottom-right'>(() => {
    const saved = localStorage.getItem('timerPosition');
    return (saved === 'top-left' || saved === 'bottom-right') ? saved : 'center';
  });

  const [dailyGoal, setDailyGoal] = useState<number>(60);
  
  // Study Log: Date -> Minutes
  const [studyLog, setStudyLog] = useState<Record<string, number>>({});
  
  // Subject Time Log: SubjectID -> Total Minutes
  const [subjectTimeLog, setSubjectTimeLog] = useState<Record<number, number>>({});

  // Question Log: Date -> { total: number, correct: number }
  const [questionLog, setQuestionLog] = useState<Record<string, { total: number, correct: number }>>({});

  // --- PERSISTENCE ---
  useEffect(() => { localStorage.setItem('autoTimeMode', autoTimeMode.toString()); }, [autoTimeMode]);
  useEffect(() => { localStorage.setItem('themeMode', themeMode); }, [themeMode]);
  useEffect(() => { localStorage.setItem('activeBackground', activeBackground); }, [activeBackground]);
  useEffect(() => { localStorage.setItem('timerPosition', timerPosition); }, [timerPosition]);
  useEffect(() => { localStorage.setItem('neutralPalette', neutralPalette); }, [neutralPalette]);
  
  useEffect(() => {
    const savedLog = localStorage.getItem('studyLog');
    const savedGoal = localStorage.getItem('dailyGoal');
    const savedQLog = localStorage.getItem('questionLog');
    const savedSubTime = localStorage.getItem('subjectTimeLog');
    
    if (savedLog) setStudyLog(JSON.parse(savedLog));
    if (savedGoal) setDailyGoal(Number(savedGoal));
    if (savedQLog) setQuestionLog(JSON.parse(savedQLog));
    if (savedSubTime) setSubjectTimeLog(JSON.parse(savedSubTime));
  }, []);

  useEffect(() => {
    localStorage.setItem('studyLog', JSON.stringify(studyLog));
    localStorage.setItem('dailyGoal', dailyGoal.toString());
    localStorage.setItem('questionLog', JSON.stringify(questionLog));
    localStorage.setItem('subjectTimeLog', JSON.stringify(subjectTimeLog));
  }, [studyLog, dailyGoal, questionLog, subjectTimeLog]);
  
  // Update achievements when data changes
  useEffect(() => {
    setAchievements(loadAchievements());
  }, [studyLog, questionLog, subjects]);
  
  // --- HANDLERS ---
  const handleStudyUpdate = (minutes: number, questions: number = 0, correct: number = 0, subjectId?: number) => {
    const today = new Date().toLocaleDateString('en-CA');
    
    // Update Time
    if (minutes > 0) {
        setStudyLog(prev => ({
          ...prev,
          [today]: (prev[today] || 0) + minutes
        }));

        // Se houver um Subject ID associado, atualiza o tempo dele
        if (subjectId) {
            setSubjectTimeLog(prev => ({
                ...prev,
                [subjectId]: (prev[subjectId] || 0) + minutes
            }));
        }
    }

    // Update Questions
    if (questions > 0 || correct > 0) {
        setQuestionLog(prev => {
            const current = prev[today] || { total: 0, correct: 0 };
            return {
                ...prev,
                [today]: {
                    total: current.total + questions,
                    correct: current.correct + correct
                }
            };
        });
    }
  };

  // Handler para mudar view
  const handleViewChange = (view: ViewType) => {
    play8BitSound('open');
    setCurrentView(view);
  };

  // --- BACKGROUND LOGIC ---
  const getBackgroundComponent = () => {
    // 1. First priority: Explicitly selected image/GIF preset
    // This allows Minimalist/Neutral themes to use GIF backgrounds
    const selectedPreset = BACKGROUND_PRESETS.find(p => p.id === activeBackground);
    if (selectedPreset && selectedPreset.url) {
        return <ImageBackground url={selectedPreset.url} />;
    }

    // 2. Fallback to Theme Default "Dynamic" backgrounds
    if (themeMode === 'minimalist') return <MinimalistBackground />;
    
    if (themeMode === 'neutral') {
       // Dark mode uses special background component
       if (neutralPalette === 'dark') {
         return <DarkNeutralBackground />;
       }
       
       // Other Neutral palettes use solid colors
       const bgColor = neutralPalette === 'warm' 
         ? '#E8DDD0' 
         : neutralPalette === 'cool' 
           ? '#D8E0E8'
           : '#D0D0D0';
       return <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />;
    }
    
    // Mario Default
    return <SuperMarioBackground autoTimeMode={autoTimeMode} />;
  };

  // --- PALETAS NEUTRAL ---
  const getNeutralPaletteColors = () => {
    switch(neutralPalette) {
      case 'warm':
        return {
          bg: 'bg-[#E8DDD0]/60',
          border: 'border-[#5C4A3A]/60',
          shadow: 'shadow-[8px_8px_0px_rgba(92,74,58,0.25)]',
          separator: 'bg-[#5C4A3A]/60',
          text: 'text-[#3A2F25]'
        };
      case 'cool':
        return {
          bg: 'bg-[#D8E0E8]/60',
          border: 'border-[#3A4A5C]/60',
          shadow: 'shadow-[8px_8px_0px_rgba(58,74,92,0.25)]',
          separator: 'bg-[#3A4A5C]/60',
          text: 'text-[#1F2A35]'
        };
      case 'dark':
        return {
          bg: 'bg-[#1A1A1A]/80',
          border: 'border-[#404040]/80',
          shadow: 'shadow-[8px_8px_0px_rgba(0,0,0,0.5)]',
          separator: 'bg-[#404040]/80',
          text: 'text-[#E0E0E0]'
        };
      default: // classic
        return {
          bg: 'bg-[#E0E0E0]/60',
          border: 'border-[#404040]/60',
          shadow: 'shadow-[8px_8px_0px_rgba(0,0,0,0.2)]',
          separator: 'bg-[#404040]/60',
          text: 'text-[#202020]'
        };
    }
  };

  const getSideMenuColors = () => {
      switch(themeMode) {
          case 'minimalist': 
            return 'bg-black/60 border-4 border-white/60 shadow-[8px_8px_0px_rgba(255,255,255,0.6)]';
          case 'neutral': {
            const palette = getNeutralPaletteColors();
            return `${palette.bg} border-4 ${palette.border} ${palette.shadow}`;
          }
          default: 
            return 'bg-gradient-to-b from-black/60 to-black/50 border-4 border-black/60 shadow-[8px_8px_0px_rgba(0,0,0,0.15)]';
      }
  };

  const getToggleBtnStyle = () => {
      switch(themeMode) {
          // Minimalist: Preto e branco pixelado
          case 'minimalist': 
            return 'text-white bg-black/60 border-4 border-white/60 hover:bg-white hover:text-black shadow-[4px_4px_0px_rgba(255,255,255,0.6)] transition-colors';
          
          // Neutral: Cores baseadas na paleta
          case 'neutral': {
            const palette = getNeutralPaletteColors();
            return `${palette.text} ${palette.bg} border-4 ${palette.border} hover:opacity-80 ${palette.shadow} transition-colors`;
          }
          
          // Mario (Default): Preto com degradê
          default: 
            return 'text-white bg-gradient-to-b from-black/60 to-black/50 border-4 border-black/60 hover:from-black/70 hover:to-black/60 shadow-[4px_4px_0px_rgba(0,0,0,0.15)] transition-all';
      }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Camada de Fundo (Canvas) */}
      <div className="absolute inset-0 z-0">
        {getBackgroundComponent()}
      </div>

      {/* Camada de UI Principal - Centralizada */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto transform translate-y-[-20px] w-full max-w-6xl flex justify-center">
          {currentView === 'timer' && (
             <PixelTimer 
                subjects={subjects} 
                setSubjects={setSubjects} 
                onStudyUpdate={handleStudyUpdate}
                themeMode={themeMode}
                neutralPalette={neutralPalette}
                timerPosition={timerPosition}
             />
          )}
          {currentView === 'materials' && (
             <StudyMaterials 
                subjects={subjects} 
                setSubjects={setSubjects}
                themeMode={themeMode}
                neutralPalette={neutralPalette}
             />
          )}
          {currentView === 'calendar' && (
             <StudyCalendar 
                dailyGoal={dailyGoal}
                setDailyGoal={setDailyGoal}
                studyLog={studyLog}
                themeMode={themeMode}
                neutralPalette={neutralPalette}
             />
          )}
          {currentView === 'agenda' && (
             <Agenda 
                themeMode={themeMode}
                neutralPalette={neutralPalette}
             />
          )}
          {currentView === 'status' && (
             <StudyStatus 
                subjects={subjects}
                studyLog={studyLog}
                questionLog={questionLog}
                subjectTimeLog={subjectTimeLog}
                themeMode={themeMode}
                neutralPalette={neutralPalette}
                onNavigateToAchievements={() => handleViewChange('achievements')}
             />
          )}
          {currentView === 'settings' && (
             <Settings 
                subjects={subjects} 
                setSubjects={setSubjects}
                studyLog={studyLog}
                setStudyLog={setStudyLog}
                questionLog={questionLog}
                setQuestionLog={setQuestionLog}
                dailyGoal={dailyGoal}
                setDailyGoal={setDailyGoal}
                autoTimeMode={autoTimeMode}
                setAutoTimeMode={setAutoTimeMode}
                themeMode={themeMode}
                setThemeMode={setThemeMode}
                activeBackground={activeBackground}
                setActiveBackground={setActiveBackground}
                timerPosition={timerPosition}
                setTimerPosition={setTimerPosition}
                neutralPalette={neutralPalette}
                setNeutralPalette={setNeutralPalette}
                achievements={achievements}
             />
          )}
          {currentView === 'achievements' && (
             <Achievements 
                studyLog={studyLog}
                questionLog={questionLog}
                subjects={subjects}
                themeMode={themeMode}
                neutralPalette={neutralPalette}
             />
          )}
        </div>
      </div>

      {/* NOVO BOTÃO DE MENU FLUTUANTE (Retrô/Pixelado) */}
      <button 
        onClick={(e) => {
            e.stopPropagation();
            play8BitSound('click');
            setIsSidebarOpen(!isSidebarOpen);
        }}
        className={`
            fixed top-4 right-4 z-50 
            w-12 h-12
            flex items-center justify-center 
            cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200
            pointer-events-auto
            ${getToggleBtnStyle()}
        `}
        style={{ imageRendering: 'pixelated' }}
        title={isSidebarOpen ? "Close Menu" : "Open Menu"}
      >
        {isSidebarOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" />
            </svg>
        ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" />
            </svg>
        )}
      </button>

      {/* Menu Lateral - Estilo Retrô/Pixelado */}
      <div 
        className={`
            fixed right-6 top-1/2 transform -translate-y-1/2 z-40 
            transition-all duration-300 ease-out pointer-events-none
            ${isSidebarOpen ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}
        `}
        style={{ imageRendering: 'pixelated' }}
      >
         <div className={`
                pointer-events-auto
                ${getSideMenuColors()} 
                p-4
                flex flex-col gap-3 items-center
                min-w-[5rem]
            `}
            style={{ imageRendering: 'pixelated' }}
         >
                {/* Todos os Ícones do Menu */}
                {MENU_ITEMS.map((item) => {
                    const isActive = item.id === currentView;
                    return (
                        <div key={item.id} className="relative flex flex-col items-center">
                             <RetroButton 
                                onClick={() => isActive ? null : handleViewChange(item.id)} 
                                colorType={isActive ? item.colorType : 'gray'}
                                size="icon" 
                                className={`${isActive ? 'w-14 h-14 shadow-lg' : 'w-12 h-12'} hover:scale-105 transition-transform ${isActive ? 'cursor-default' : ''}`}
                                themeMode={themeMode}
                                neutralPalette={neutralPalette}
                                title={item.title}
                            >
                                {item.icon}
                            </RetroButton>
                        </div>
                    );
                })}
         </div>
      </div>

      {/* Music Player */}
      <div>
        <MusicPlayer themeMode={themeMode} neutralPalette={neutralPalette} />
      </div>
    </div>
  );
}
