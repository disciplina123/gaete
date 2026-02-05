import React, { useState } from 'react';
import { RetroButton, THEME, play8BitSound, getThemeColors, BACKGROUND_PRESETS } from './RetroUtils';
import { Subject } from './StudyMaterials';
import { Achievement, isFeatureUnlocked } from './AchievementSystem';

interface SettingsProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  studyLog: Record<string, number>;
  setStudyLog: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  questionLog: Record<string, { total: number, correct: number }>;
  setQuestionLog: React.Dispatch<React.SetStateAction<Record<string, { total: number, correct: number }>>>;
  dailyGoal: number;
  setDailyGoal: React.Dispatch<React.SetStateAction<number>>;
  autoTimeMode: boolean;
  setAutoTimeMode: React.Dispatch<React.SetStateAction<boolean>>;
  themeMode: 'mario' | 'minimalist' | 'neutral';
  setThemeMode: React.Dispatch<React.SetStateAction<'mario' | 'minimalist' | 'neutral'>>;
  activeBackground: string;
  setActiveBackground: React.Dispatch<React.SetStateAction<string>>;
  timerPosition: 'center' | 'top-left' | 'bottom-right';
  setTimerPosition: React.Dispatch<React.SetStateAction<'center' | 'top-left' | 'bottom-right'>>;
  neutralPalette: 'classic' | 'warm' | 'cool' | 'dark';
  setNeutralPalette: React.Dispatch<React.SetStateAction<'classic' | 'warm' | 'cool' | 'dark'>>;
  achievements: Achievement[];
}

export default function Settings({ 
  subjects, 
  setSubjects, 
  studyLog, 
  setStudyLog,
  questionLog,
  setQuestionLog,
  dailyGoal,
  setDailyGoal,
  autoTimeMode,
  setAutoTimeMode,
  themeMode,
  setThemeMode,
  activeBackground,
  setActiveBackground,
  timerPosition,
  setTimerPosition,
  neutralPalette,
  setNeutralPalette,
  achievements
}: SettingsProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [message, setMessage] = useState('');

  const colors = getThemeColors(themeMode, neutralPalette);
  const isMinimalist = themeMode === 'minimalist';
  const isNeutral = themeMode === 'neutral';
  
  // Helper para verificar se feature está desbloqueada
  const checkUnlocked = (featureId: string): boolean => {
    return isFeatureUnlocked(featureId, achievements);
  };
  
  // Obter conquistas necessárias para desbloquear
  const getRequiredAchievements = (featureId: string): number => {
    const tiers = [
      { features: ['theme-mario', 'mario-dynamic'], required: 0 },
      { features: ['theme-neutral', 'palette-classic', 'auto-time-mode'], required: 5 },
      { features: ['timer-position', 'daily-goal-custom', 'alpine-peaks', 'sunset-city'], required: 10 },
      { features: ['palette-warm', 'palette-cool', 'mystic-forest', 'ocean-view'], required: 18 },
      { features: ['theme-minimalist', 'cloud-kingdom', 'rainy-street', 'music-player'], required: 26 },
      { features: ['palette-dark', 'train-journey', 'agenda-full'], required: 32 }
    ];
    
    for (const tier of tiers) {
      if (tier.features.includes(featureId)) {
        return tier.required;
      }
    }
    return 0;
  };

  // Função para exportar todos os dados
  const handleExport = () => {
    try {
      const data = {
        version: '1.1',
        exportDate: new Date().toISOString(),
        subjects,
        studyLog,
        questionLog,
        dailyGoal,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `super-mario-study-backup-${new Date().toLocaleDateString('en-CA')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      play8BitSound('coin');
      setMessage('✅ Backup exportado!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      play8BitSound('hurt');
      setMessage('❌ Erro ao exportar');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  // Função para importar dados
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Validação básica
        if (!data.subjects || !data.studyLog || data.dailyGoal === undefined) {
          throw new Error('Formato inválido');
        }

        // Importar dados
        setSubjects(data.subjects);
        setStudyLog(data.studyLog);
        setDailyGoal(data.dailyGoal);
        if (data.questionLog) setQuestionLog(data.questionLog);

        // Salvar no localStorage
        localStorage.setItem('subjects', JSON.stringify(data.subjects));
        localStorage.setItem('studyLog', JSON.stringify(data.studyLog));
        localStorage.setItem('dailyGoal', data.dailyGoal.toString());
        if (data.questionLog) localStorage.setItem('questionLog', JSON.stringify(data.questionLog));

        play8BitSound('powerup');
        setMessage('✅ Backup importado!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        play8BitSound('hurt');
        setMessage('❌ Arquivo inválido');
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  // Função para criar backup no localStorage
  const handleBackupToStorage = () => {
    try {
      const backupKey = `backup-${new Date().toISOString()}`;
      const data = {
        subjects,
        studyLog,
        questionLog,
        dailyGoal,
      };
      
      localStorage.setItem(backupKey, JSON.stringify(data));
      
      play8BitSound('coin');
      setMessage('✅ Backup salvo!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      play8BitSound('hurt');
      setMessage('❌ Erro ao salvar');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  // Função para resetar todos os dados
  const handleReset = () => {
    if (!confirm('⚠️ Resetar todos os dados?')) {
      return;
    }

    try {
      setSubjects([]);
      setStudyLog({});
      setQuestionLog({});
      setDailyGoal(60);

      localStorage.removeItem('subjects');
      localStorage.removeItem('studyLog');
      localStorage.removeItem('questionLog');
      localStorage.removeItem('dailyGoal');

      play8BitSound('hurt');
      setMessage('🗑️ Dados resetados');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      play8BitSound('hurt');
      setMessage('❌ Erro ao resetar');
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  const handleBackgroundChange = (id: string) => {
      setActiveBackground(id);
      play8BitSound('powerup');
  };

  // Estilos comuns para containers internos
  const containerStyle = {
    backgroundColor: isMinimalist ? '#000' : (isNeutral ? '#F0F0F0' : '#fff'),
    borderColor: isMinimalist ? '#fff' : (isNeutral ? '#808080' : '#000'),
    color: isMinimalist ? '#fff' : '#000'
  };

  // Estilo para itens de lista/linhas
  const itemStyle = (defaultBg: string, borderCol: string) => ({
    backgroundColor: isMinimalist ? '#000' : (isNeutral ? '#E8E8E8' : defaultBg),
    borderColor: isMinimalist ? '#fff' : (isNeutral ? '#A0A0A0' : borderCol),
    color: isMinimalist ? '#fff' : '#000',
    border: isMinimalist ? '2px solid #fff' : undefined
  });

  return (
    <div className="w-full max-w-3xl mx-auto h-[550px] overflow-y-auto custom-scrollbar">
      <div className="border-4 border-black rounded-lg shadow-2xl overflow-hidden"
           style={{ backgroundColor: colors.ui.background, boxShadow: isMinimalist ? '8px 8px 0 #fff' : (isNeutral ? '8px 8px 0 rgba(0,0,0,0.1)' : '8px 8px 0 rgba(0,0,0,0.5)'), borderColor: isMinimalist ? '#fff' : (isNeutral ? '#808080' : '#000') }}>
        
        {/* Header */}
        <div className="border-b-4 border-black p-4 text-center relative sticky top-0 z-10"
             style={{ backgroundColor: colors.yellow.main, borderColor: isMinimalist ? '#fff' : (isNeutral ? '#808080' : '#000') }}>
          <h2 className="text-xl font-bold drop-shadow-md tracking-wider"
              style={{ fontFamily: THEME.font, color: colors.yellow.text, textShadow: (isMinimalist || isNeutral) ? 'none' : '2px 2px 0 white' }}>
            SETTINGS
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {/* Notificações */}
          {showSuccess && (
            <div className="bg-green-500 border-4 border-green-700 text-white p-3 rounded-lg text-center text-sm animate-bounce"
                 style={{ fontFamily: THEME.font, backgroundColor: isMinimalist ? '#000' : (isNeutral ? '#A0C0A0' : undefined), borderColor: isMinimalist ? '#fff' : (isNeutral ? '#709070' : undefined), color: isMinimalist ? '#fff' : (isNeutral ? '#000' : undefined) }}>
              {message}
            </div>
          )}
          {showError && (
            <div className="bg-red-500 border-4 border-red-700 text-white p-3 rounded-lg text-center text-sm animate-bounce"
                 style={{ fontFamily: THEME.font, backgroundColor: isMinimalist ? '#000' : (isNeutral ? '#D0A0A0' : undefined), borderColor: isMinimalist ? '#fff' : (isNeutral ? '#906060' : undefined), color: isMinimalist ? '#fff' : (isNeutral ? '#000' : undefined) }}>
              {message}
            </div>
          )}

          {/* Seção de Backup */}
          <div className="border-4 border-black rounded-lg p-4 space-y-3" style={containerStyle}>
            <h3 className="text-sm font-bold mb-3 pb-2 border-b-2"
                style={{ fontFamily: THEME.font, borderColor: isMinimalist ? '#fff' : (isNeutral ? '#A0A0A0' : '#e5e7eb'), color: isMinimalist ? '#fff' : '#1f2937' }}>
              BACKUP
            </h3>

            <div className="space-y-2">
              {/* Exportar */}
              <div className="flex items-center justify-between gap-3 p-2 border-2 rounded" style={itemStyle('#e6ffe6', '#86efac')}>
                <span className="text-[10px] font-bold" style={{ fontFamily: THEME.font, color: isMinimalist ? '#fff' : '#1f2937' }}>
                  EXPORT
                </span>
                <RetroButton onClick={handleExport} colorType="green" size="small" sound="coin" themeMode={themeMode}                neutralPalette={neutralPalette}>                  EXPORT                </RetroButton>              </div>

              {/* Importar */}
              <div className="flex items-center justify-between gap-3 p-2 border-2 rounded" style={itemStyle('#e6f2ff', '#93c5fd')}>
                <span className="text-[10px] font-bold" style={{ fontFamily: THEME.font, color: isMinimalist ? '#fff' : '#1f2937' }}>
                  IMPORT
                </span>
                <label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                  <RetroButton as="span" colorType="blue" size="small" sound="open" themeMode={themeMode}                neutralPalette={neutralPalette}>                    IMPORT                  </RetroButton>                </label>
              </div>

              {/* Backup Local */}
              <div className="flex items-center justify-between gap-3 p-2 border-2 rounded" style={itemStyle('#fffde6', '#fde047')}>
                <span className="text-[10px] font-bold" style={{ fontFamily: THEME.font, color: isMinimalist ? '#fff' : '#1f2937' }}>
                  QUICK SAVE
                </span>
                <RetroButton onClick={handleBackupToStorage} colorType="yellow" size="small" sound="coin" themeMode={themeMode}                neutralPalette={neutralPalette}>                  SAVE                </RetroButton>              </div>
            </div>
          </div>

          {/* Seção de Customização */}
          <div className="border-4 border-black rounded-lg p-4 space-y-3" style={containerStyle}>
            <h3 className="text-sm font-bold mb-3 pb-2 border-b-2"
                style={{ fontFamily: THEME.font, borderColor: isMinimalist ? '#fff' : (isNeutral ? '#A0A0A0' : '#e5e7eb'), color: isMinimalist ? '#fff' : '#1f2937' }}>
              CUSTOMIZE
            </h3>

            <div className="space-y-2">
              {/* TEMA - Toggle */}
              <div className="flex flex-col gap-3 p-2 border-2 rounded" style={itemStyle('#f3e6ff', '#d8b4fe')}>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold" style={{ fontFamily: THEME.font, color: isMinimalist ? '#fff' : '#1f2937' }}>
                    WORLD THEME
                  </span>
                  <span className="text-[8px]" style={{ fontFamily: THEME.font, color: isMinimalist ? '#ccc' : '#4b5563' }}>
                    Select your map style
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={() => { play8BitSound('click'); setThemeMode('mario'); }}
                        className={`px-2 py-1 text-[8px] font-bold border-2 ${themeMode === 'mario' ? 'bg-yellow-400 border-black' : 'bg-gray-200 border-gray-400 text-gray-500'}`}
                        style={{ fontFamily: THEME.font }}>
                        MARIO
                    </button>
                    <button 
                        onClick={() => { 
                          if (checkUnlocked('theme-minimalist')) {
                            play8BitSound('click'); 
                            setThemeMode('minimalist');
                          } else {
                            play8BitSound('stomp');
                            alert(`🔒 Bloqueado! Desbloqueie ${getRequiredAchievements('theme-minimalist')} conquistas.`);
                          }
                        }}
                        disabled={!checkUnlocked('theme-minimalist')}
                        className={`px-2 py-1 text-[8px] font-bold border-2 ${themeMode === 'minimalist' ? 'bg-white text-black border-white' : 'bg-gray-200 border-gray-400 text-gray-500'} ${!checkUnlocked('theme-minimalist') ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{ fontFamily: THEME.font }}>
                        {checkUnlocked('theme-minimalist') ? 'MINI' : '🔒 MINI'}
                    </button>
                     <button 
                        onClick={() => {
                          if (checkUnlocked('theme-neutral')) {
                            play8BitSound('click');
                            setThemeMode('neutral');
                          } else {
                            play8BitSound('stomp');
                            alert(`🔒 Bloqueado! Desbloqueie ${getRequiredAchievements('theme-neutral')} conquistas.`);
                          }
                        }}
                        disabled={!checkUnlocked('theme-neutral')}
                        className={`px-2 py-1 text-[8px] font-bold border-2 ${themeMode === 'neutral' ? 'bg-[#C0C0C0] text-black border-[#606060]' : 'bg-gray-200 border-gray-400 text-gray-500'} ${!checkUnlocked('theme-neutral') ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{ fontFamily: THEME.font }}>
                        {checkUnlocked('theme-neutral') ? 'NEUTRAL' : '🔒 NEUTRAL'}
                    </button>
                </div>
              </div>

              {/* BACKGROUND SELECTOR (Now available in all modes) */}
              <div className="flex flex-col gap-3 p-2 border-2 rounded" style={itemStyle('#e0f7fa', '#4dd0e1')}>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold" style={{ fontFamily: THEME.font }}>
                        BACKGROUND STYLE
                    </span>
                    <span className="text-[8px]" style={{ fontFamily: THEME.font, color: isMinimalist ? '#ccc' : '#4b5563' }}>
                        Choose your atmosphere {themeMode === 'neutral' && '(Overrides neutral gray)'} {themeMode === 'minimalist' && '(Overrides black)'}
                    </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {BACKGROUND_PRESETS.map(preset => {
                        const isUnlocked = checkUnlocked(preset.id);
                        const required = getRequiredAchievements(preset.id);
                        
                        return (
                        <button
                            key={preset.id}
                            onClick={() => {
                              if (isUnlocked) {
                                handleBackgroundChange(preset.id);
                              } else {
                                play8BitSound('stomp');
                                alert(`🔒 Bloqueado! Desbloqueie ${required} conquistas.`);
                              }
                            }}
                            disabled={!isUnlocked}
                            className={`
                                relative p-2 text-[8px] font-bold border-2 rounded h-12 overflow-hidden flex items-center justify-center text-center
                                transition-transform
                                ${isUnlocked ? 'hover:scale-105' : 'opacity-40 cursor-not-allowed'}
                                ${activeBackground === preset.id ? 'border-green-600 ring-2 ring-green-400' : 'border-gray-400 opacity-80'}
                            `}
                            style={{ 
                                fontFamily: THEME.font,
                                backgroundImage: preset.url && isUnlocked ? `url(${preset.url})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundColor: preset.id === 'mario-dynamic' ? (isMinimalist ? '#000' : '#87CEEB') : '#000',
                                color: (preset.url || isMinimalist) ? '#FFF' : '#000',
                                textShadow: preset.url ? '1px 1px 0 #000' : 'none',
                                borderColor: isMinimalist ? '#FFF' : undefined
                            }}
                        >
                            <span className="relative z-10">{isUnlocked ? preset.name : `🔒 ${preset.name}`}</span>
                            {activeBackground === preset.id && (
                                <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 border border-white rounded-full m-1"></div>
                            )}
                        </button>
                    )})}
                </div>

                {/* Auto Time Mode Info (Only relevant for Mario dynamic map) */}
                {activeBackground === 'mario-dynamic' && themeMode === 'mario' && (
                    <div 
                        onClick={() => {
                          if (checkUnlocked('auto-time-mode')) {
                            play8BitSound('click');
                            setAutoTimeMode(prev => !prev);
                          } else {
                            play8BitSound('stomp');
                            alert(`🔒 Bloqueado! Desbloqueie ${getRequiredAchievements('auto-time-mode')} conquistas.`);
                          }
                        }}
                        className={`flex items-center gap-2 mt-2 ${checkUnlocked('auto-time-mode') ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                    >
                        <div className={`w-4 h-4 border-2 flex items-center justify-center ${autoTimeMode ? 'bg-green-500 border-green-700' : 'bg-gray-300 border-gray-500'}`}>
                            {autoTimeMode && <div className="w-2 h-2 bg-white"></div>}
                        </div>
                        <span className="text-[8px] font-bold">
                          {checkUnlocked('auto-time-mode') ? 'ENABLE DAY/NIGHT CYCLE' : '🔒 DAY/NIGHT CYCLE'}
                        </span>
                    </div>
                )}
              </div>

              {/* TIMER POSITION */}
              <div className="flex flex-col gap-3 p-2 border-2 rounded" style={itemStyle('#fff4e6', '#fbbf24')}>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold" style={{ fontFamily: THEME.font, color: isMinimalist ? '#fff' : '#1f2937' }}>
                    MINIMIZED TIMER POSITION
                  </span>
                  <span className="text-[8px]" style={{ fontFamily: THEME.font, color: isMinimalist ? '#ccc' : '#4b5563' }}>
                    Where the timer appears when minimized
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={() => { play8BitSound('click'); setTimerPosition('center'); }}
                        className={`px-3 py-1 text-[8px] font-bold border-2 ${timerPosition === 'center' ? (isMinimalist ? 'bg-white text-black border-white' : (isNeutral ? 'bg-[#90B090] border-black' : 'bg-yellow-400 border-black')) : 'bg-gray-200 border-gray-400 text-gray-500'}`}
                        style={{ fontFamily: THEME.font }}>
                        CENTER
                    </button>
                    <button 
                        onClick={() => { play8BitSound('click'); setTimerPosition('top-left'); }}
                        className={`px-3 py-1 text-[8px] font-bold border-2 ${timerPosition === 'top-left' ? (isMinimalist ? 'bg-white text-black border-white' : (isNeutral ? 'bg-[#90B090] border-black' : 'bg-yellow-400 border-black')) : 'bg-gray-200 border-gray-400 text-gray-500'}`}
                        style={{ fontFamily: THEME.font }}>
                        TOP LEFT
                    </button>
                     <button 
                        onClick={() => { play8BitSound('click'); setTimerPosition('bottom-right'); }}
                        className={`px-3 py-1 text-[8px] font-bold border-2 ${timerPosition === 'bottom-right' ? (isMinimalist ? 'bg-white text-black border-white' : (isNeutral ? 'bg-[#90B090] border-black' : 'bg-yellow-400 border-black')) : 'bg-gray-200 border-gray-400 text-gray-500'}`}
                        style={{ fontFamily: THEME.font }}>
                        BOTTOM RIGHT
                    </button>
                </div>
              </div>

              {/* NEUTRAL PALETTE (only visible when Neutral theme is active) */}
              {themeMode === 'neutral' && (
                <div className="flex flex-col gap-3 p-2 border-2 rounded" style={itemStyle('#f0f9ff', '#93c5fd')}>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold" style={{ fontFamily: THEME.font, color: isMinimalist ? '#fff' : '#1f2937' }}>
                      COLOR PALETTE
                    </span>
                    <span className="text-[8px]" style={{ fontFamily: THEME.font, color: isMinimalist ? '#ccc' : '#4b5563' }}>
                      Choose your neutral color scheme
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                      <button 
                          onClick={() => { play8BitSound('click'); setNeutralPalette('classic'); }}
                          className={`px-3 py-2 text-[8px] font-bold border-2 flex items-center gap-2 ${neutralPalette === 'classic' ? 'bg-gray-400 border-black text-white' : 'bg-gray-200 border-gray-400 text-gray-500'}`}
                          style={{ fontFamily: THEME.font }}>
                          <div className="w-3 h-3 bg-[#E0E0E0] border border-[#404040]"></div>
                          CLASSIC
                      </button>
                      <button 
                          onClick={() => {
                            if (checkUnlocked('palette-warm')) {
                              play8BitSound('click');
                              setNeutralPalette('warm');
                            } else {
                              play8BitSound('stomp');
                              alert(`🔒 Bloqueado! Desbloqueie ${getRequiredAchievements('palette-warm')} conquistas.`);
                            }
                          }}
                          disabled={!checkUnlocked('palette-warm')}
                          className={`px-3 py-2 text-[8px] font-bold border-2 flex items-center gap-2 ${neutralPalette === 'warm' ? 'bg-[#B0A088] border-black text-white' : 'bg-gray-200 border-gray-400 text-gray-500'} ${!checkUnlocked('palette-warm') ? 'opacity-50 cursor-not-allowed' : ''}`}
                          style={{ fontFamily: THEME.font }}>
                          <div className="w-3 h-3 bg-[#E8DDD0] border border-[#5C4A3A]"></div>
                          {checkUnlocked('palette-warm') ? 'WARM' : '🔒 WARM'}
                      </button>
                       <button 
                          onClick={() => {
                            if (checkUnlocked('palette-cool')) {
                              play8BitSound('click');
                              setNeutralPalette('cool');
                            } else {
                              play8BitSound('stomp');
                              alert(`🔒 Bloqueado! Desbloqueie ${getRequiredAchievements('palette-cool')} conquistas.`);
                            }
                          }}
                          disabled={!checkUnlocked('palette-cool')}
                          className={`px-3 py-2 text-[8px] font-bold border-2 flex items-center gap-2 ${neutralPalette === 'cool' ? 'bg-[#90A0B0] border-black text-white' : 'bg-gray-200 border-gray-400 text-gray-500'} ${!checkUnlocked('palette-cool') ? 'opacity-50 cursor-not-allowed' : ''}`}
                          style={{ fontFamily: THEME.font }}>
                          <div className="w-3 h-3 bg-[#D8E0E8] border border-[#3A4A5C]"></div>
                          {checkUnlocked('palette-cool') ? 'COOL' : '🔒 COOL'}
                      </button>
                      <button 
                          onClick={() => {
                            if (checkUnlocked('palette-dark')) {
                              play8BitSound('click');
                              setNeutralPalette('dark');
                            } else {
                              play8BitSound('stomp');
                              alert(`🔒 Bloqueado! Desbloqueie ${getRequiredAchievements('palette-dark')} conquistas.`);
                            }
                          }}
                          disabled={!checkUnlocked('palette-dark')}
                          className={`px-3 py-2 text-[8px] font-bold border-2 flex items-center gap-2 ${neutralPalette === 'dark' ? 'bg-[#404040] border-black text-white' : 'bg-gray-200 border-gray-400 text-gray-500'} ${!checkUnlocked('palette-dark') ? 'opacity-50 cursor-not-allowed' : ''}`}
                          style={{ fontFamily: THEME.font }}>
                          <div className="w-3 h-3 bg-[#1A1A1A] border border-[#404040]"></div>
                          {checkUnlocked('palette-dark') ? 'DARK' : '🔒 DARK'}
                      </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Seção de Perigo */}
          <div className="bg-red-100 border-4 border-red-500 rounded-lg p-4 space-y-3" style={itemStyle(isMinimalist ? '#000' : (isNeutral ? '#E0D0D0' : '#fee2e2'), isMinimalist ? '#fff' : (isNeutral ? '#A07070' : '#ef4444'))}>
            <h3 className="text-sm font-bold mb-3 pb-2 border-b-2"
                style={{ fontFamily: THEME.font, color: isMinimalist ? '#fff' : (isNeutral ? '#502020' : '#991b1b'), borderColor: isMinimalist ? '#fff' : (isNeutral ? '#A07070' : '#f87171') }}>
              DANGER
            </h3>

            <div className="flex items-center justify-between gap-3 p-2 border-2 rounded" style={itemStyle(isMinimalist ? '#000' : (isNeutral ? '#F0E0E0' : '#fef2f2'), isMinimalist ? '#fff' : (isNeutral ? '#C0A0A0' : '#fca5a5'))}>
              <span className="text-[10px] font-bold" style={{ fontFamily: THEME.font, color: isMinimalist ? '#fff' : (isNeutral ? '#502020' : '#991b1b') }}>
                RESET ALL
              </span>
              <RetroButton onClick={handleReset} colorType="red" size="small" sound="hurt" themeMode={themeMode}                neutralPalette={neutralPalette}>                RESET              </RetroButton>            </div>
          </div>
        </div>
      </div>
    </div>
  );
}