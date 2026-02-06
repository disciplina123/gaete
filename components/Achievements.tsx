import React, { useEffect, useState } from 'react';
import { THEME, getThemeColors } from './RetroUtils';
import { 
  Achievement, 
  loadAchievements, 
  saveAchievements, 
  checkAndUnlockAchievements,
  getCurrentTier,
  getNextTier
} from './AchievementSystem';
import { Subject } from './StudyMaterials';

interface AchievementsProps {
  studyLog: Record<string, number>;
  questionLog: Record<string, { total: number, correct: number }>;
  subjects: Subject[];
  themeMode: 'mario' | 'minimalist' | 'neutral';
  neutralPalette?: 'classic' | 'warm' | 'cool' | 'dark';
}

export default function Achievements({ 
  studyLog, 
  questionLog, 
  subjects,
  themeMode,
  neutralPalette = 'classic'
}: AchievementsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const colors = getThemeColors(themeMode, neutralPalette);
  const isMinimalist = themeMode === 'minimalist';
  const isNeutral = themeMode === 'neutral';
  
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const currentTier = getCurrentTier(achievements);
  const nextTier = getNextTier(achievements);

  // Group by category
  const timeAchievements = achievements.filter(a => a.category === 'time');
  const streakAchievements = achievements.filter(a => a.category === 'streak');
  const questionsAchievements = achievements.filter(a => a.category === 'questions');
  const orgAchievements = achievements.filter(a => a.category === 'organization');

  useEffect(() => {
    try {
      const loaded = loadAchievements();
      const { updatedAchievements } = checkAndUnlockAchievements(
        loaded,
        studyLog,
        questionLog,
        subjects
      );
      
      setAchievements(updatedAchievements);
      saveAchievements(updatedAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  }, [studyLog, questionLog, subjects]);

  const getCategoryColor = (category: string) => {
    if (isMinimalist) return '#FFF';
    if (isNeutral) {
      if (neutralPalette === 'dark') return '#E0E0E0';
      return '#404040';
    }
    
    switch(category) {
      case 'time': return colors.blue.main;
      case 'streak': return colors.orange.main;
      case 'questions': return colors.green.main;
      case 'organization': return colors.purple.main;
      default: return colors.ui.text;
    }
  };

  const getCategoryBg = (category: string) => {
    if (isMinimalist) return '#000';
    if (isNeutral) {
      if (neutralPalette === 'dark') return '#2A2A2A';
      return '#E8E8E8';
    }
    
    switch(category) {
      case 'time': return 'rgba(64, 128, 255, 0.1)';
      case 'streak': return 'rgba(255, 144, 32, 0.1)';
      case 'questions': return 'rgba(32, 208, 64, 0.1)';
      case 'organization': return 'rgba(153, 64, 255, 0.1)';
      default: return colors.ui.background;
    }
  };

  const renderAchievement = (achievement: Achievement) => {
    const progress = achievement.unlocked ? 100 : 
      Math.min(100, ((achievement.requirement.current || 0) / achievement.requirement.target) * 100);

    return (
      <div
        key={achievement.id}
        className="relative p-3 border-4 flex flex-col items-center justify-center gap-2"
        style={{
          backgroundColor: achievement.unlocked
            ? getCategoryBg(achievement.category)
            : (isMinimalist ? '#000' : (isNeutral ? (neutralPalette === 'dark' ? '#1A1A1A' : '#C0C0C0') : '#606060')),
          borderColor: achievement.unlocked 
            ? getCategoryColor(achievement.category)
            : (isMinimalist ? '#666' : (isNeutral ? '#606060' : '#303030')),
          boxShadow: achievement.unlocked 
            ? (isMinimalist ? '4px 4px 0px #FFF' : (isNeutral ? '4px 4px 0px rgba(0,0,0,0.3)' : '4px 4px 0px rgba(0,0,0,0.6)'))
            : (isMinimalist ? '2px 2px 0px #444' : '2px 2px 0px rgba(0,0,0,0.4)'),
          minHeight: '120px',
          imageRendering: 'pixelated' as const,
          cursor: 'pointer',
          transition: 'transform 0.1s',
          opacity: achievement.unlocked ? 1 : 0.7
        }}
        title={`${achievement.name}: ${achievement.description}${achievement.unlocked ? ' - DESBLOQUEADA!' : ` (${achievement.requirement.current || 0}/${achievement.requirement.target})`}`}
        onMouseEnter={(e) => {
          if (achievement.unlocked) {
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {/* Icon - Muito maior e mais visível */}
        <div 
          className="text-5xl mb-1"
          style={{
            filter: achievement.unlocked ? 'none' : 'grayscale(100%)',
            textShadow: achievement.unlocked 
              ? (isMinimalist ? 'none' : (isNeutral ? 'none' : '3px 3px 0px rgba(0,0,0,0.8)'))
              : 'none',
            opacity: achievement.unlocked ? 1 : 0.5
          }}
        >
          {achievement.icon}
        </div>
        
        {/* Name - Muito mais destacado */}
        <div 
          className="text-[12px] font-bold text-center leading-tight px-1"
          style={{ 
            fontFamily: THEME.font,
            color: achievement.unlocked 
              ? (isMinimalist ? '#FFF' : (isNeutral ? (neutralPalette === 'dark' ? '#FFFFFF' : '#000000') : getCategoryColor(achievement.category)))
              : (isMinimalist ? '#888' : (isNeutral ? (neutralPalette === 'dark' ? '#808080' : '#606060') : '#C0C0C0')),
            textShadow: achievement.unlocked && !isMinimalist && !isNeutral 
              ? '2px 2px 0px rgba(0,0,0,0.9)' 
              : 'none',
            WebkitTextStroke: achievement.unlocked && !isMinimalist && !isNeutral ? '0.8px rgba(0,0,0,0.6)' : '0px',
            letterSpacing: '0.5px'
          }}
        >
          {achievement.name.toUpperCase()}
        </div>

        {/* Description - Mais visível */}
        <div 
          className="text-[10px] font-bold text-center px-1"
          style={{ 
            fontFamily: THEME.font,
            color: achievement.unlocked 
              ? (isMinimalist ? '#DDD' : (isNeutral ? (neutralPalette === 'dark' ? '#C0C0C0' : '#303030') : '#FFFFFF'))
              : (isMinimalist ? '#666' : (isNeutral ? (neutralPalette === 'dark' ? '#606060' : '#808080') : '#A0A0A0')),
            textShadow: achievement.unlocked && !isMinimalist && !isNeutral 
              ? '1px 1px 0px rgba(0,0,0,0.7)' 
              : 'none'
          }}
        >
          {achievement.description}
        </div>

        {/* Progress bar for locked - More visible */}
        {!achievement.unlocked && (
          <div 
            className="absolute bottom-0 left-0 h-2 border-t-2"
            style={{
              width: `${progress}%`,
              backgroundColor: isMinimalist ? '#666' : (isNeutral ? (neutralPalette === 'dark' ? '#404040' : '#808080') : getCategoryColor(achievement.category)),
              borderColor: isMinimalist ? '#888' : '#000',
              opacity: 0.8
            }}
          />
        )}

        {/* Locked overlay effect */}
        {!achievement.unlocked && (
          <div 
            className="absolute inset-0 flex items-center justify-center text-4xl opacity-30 pointer-events-none"
            style={{
              color: isMinimalist ? '#FFF' : '#000',
              fontFamily: THEME.font
            }}
          >
            ■
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="w-full h-full p-4 overflow-y-auto"
      style={{
        backgroundColor: isMinimalist ? '#000' : (isNeutral ? (neutralPalette === 'dark' ? '#0F0F0F' : '#F5F5F5') : colors.ui.background)
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header com Tier em destaque */}
        <div 
          className="p-6 border-4 mb-4"
          style={{
            backgroundColor: isMinimalist ? '#000' : (isNeutral ? (neutralPalette === 'dark' ? '#1A1A1A' : '#E0E0E0') : colors.yellow.main),
            borderColor: isMinimalist ? '#FFF' : (isNeutral ? '#404040' : '#000'),
            boxShadow: isMinimalist ? '8px 8px 0px #FFF' : (isNeutral ? (neutralPalette === 'dark' ? '8px 8px 0px rgba(0,0,0,0.5)' : '8px 8px 0px rgba(0,0,0,0.3)') : '8px 8px 0px rgba(0,0,0,0.6)'),
            imageRendering: 'pixelated' as const
          }}
        >
          <div className="flex items-center justify-between gap-6">
            {/* Lado Esquerdo - Tier em Destaque */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="text-5xl"
                  style={{
                    filter: isMinimalist ? 'none' : 'drop-shadow(3px 3px 2px rgba(0,0,0,0.5))'
                  }}
                >
                  {currentTier.name === 'Mestre' ? '👑' : 
                   currentTier.name === 'Especialista' ? '💎' : 
                   currentTier.name === 'Estudioso' ? '🎓' :
                   currentTier.name === 'Dedicado' ? '⭐' :
                   currentTier.name === 'Aprendiz' ? '🌟' : '🌱'}
                </div>
                <div>
                  <h1 
                    className="text-4xl font-bold leading-none mb-1"
                    style={{ 
                      fontFamily: THEME.font,
                      color: isMinimalist ? '#FFF' : (isNeutral ? (neutralPalette === 'dark' ? '#FFF' : '#000') : '#000'),
                      textShadow: isMinimalist ? 'none' : (isNeutral ? 'none' : '4px 4px 0px rgba(0,0,0,0.3)'),
                      WebkitTextStroke: isMinimalist ? '0px' : (isNeutral ? '0px' : '1.5px rgba(0,0,0,0.2)')
                    }}
                  >
                    {currentTier.name.toUpperCase()}
                  </h1>
                  <p 
                    className="text-sm font-bold"
                    style={{ 
                      fontFamily: THEME.font,
                      color: isMinimalist ? '#AAA' : (isNeutral ? (neutralPalette === 'dark' ? '#B0B0B0' : '#505050') : '#000'),
                      opacity: 0.8
                    }}
                  >
                    {currentTier.description}
                  </p>
                </div>
              </div>
              
              {/* Info de conquistas */}
              <div className="flex gap-4 items-center">
                <div>
                  <p 
                    className="text-xs font-bold mb-1"
                    style={{ 
                      fontFamily: THEME.font,
                      color: isMinimalist ? '#888' : (isNeutral ? (neutralPalette === 'dark' ? '#808080' : '#606060') : '#000'),
                      opacity: 0.7
                    }}
                  >
                    CONQUISTAS
                  </p>
                  <p 
                    className="text-2xl font-bold"
                    style={{ 
                      fontFamily: THEME.font,
                      color: isMinimalist ? '#FFF' : (isNeutral ? (neutralPalette === 'dark' ? '#E0E0E0' : '#202020') : '#000')
                    }}
                  >
                    {unlockedCount}/{totalCount}
                  </p>
                </div>
                
                {nextTier && (
                  <div className="flex-1">
                    <p 
                      className="text-xs font-bold mb-1"
                      style={{ 
                        fontFamily: THEME.font,
                        color: isMinimalist ? '#888' : (isNeutral ? (neutralPalette === 'dark' ? '#808080' : '#606060') : '#000'),
                        opacity: 0.7
                      }}
                    >
                      PRÓXIMO: {nextTier.name.toUpperCase()}
                    </p>
                    <p 
                      className="text-sm font-bold"
                      style={{ 
                        fontFamily: THEME.font,
                        color: isMinimalist ? '#CCC' : (isNeutral ? (neutralPalette === 'dark' ? '#A0A0A0' : '#404040') : '#000')
                      }}
                    >
                      Faltam {nextTier.achievementsRequired - unlockedCount} conquistas
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Lado Direito - Progress bar maior */}
            <div className="w-48">
              <p 
                className="text-xs font-bold mb-2 text-center"
                style={{ 
                  fontFamily: THEME.font,
                  color: isMinimalist ? '#AAA' : (isNeutral ? (neutralPalette === 'dark' ? '#A0A0A0' : '#606060') : '#000')
                }}
              >
                PROGRESSO TOTAL
              </p>
              <div 
                className="h-8 border-4 relative mb-2"
                style={{
                  backgroundColor: isMinimalist ? '#000' : (isNeutral ? (neutralPalette === 'dark' ? '#0A0A0A' : '#C0C0C0') : '#404040'),
                  borderColor: isMinimalist ? '#FFF' : '#000',
                  imageRendering: 'pixelated' as const
                }}
              >
                <div 
                  className="h-full transition-all duration-1000"
                  style={{
                    width: `${(unlockedCount / totalCount) * 100}%`,
                    backgroundColor: isMinimalist ? '#FFF' : (isNeutral ? (neutralPalette === 'dark' ? '#80B080' : '#60A060') : colors.green.main),
                    backgroundImage: isMinimalist ? 'none' : 'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0.2) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.2) 75%)',
                    backgroundSize: '12px 12px'
                  }}
                />
              </div>
              <p 
                className="text-2xl text-center font-bold"
                style={{ 
                  fontFamily: THEME.font,
                  color: isMinimalist ? '#FFF' : (isNeutral ? (neutralPalette === 'dark' ? '#E0E0E0' : '#202020') : '#000'),
                  textShadow: isMinimalist ? 'none' : (isNeutral ? 'none' : '2px 2px 0px rgba(0,0,0,0.3)')
                }}
              >
                {Math.floor((unlockedCount / totalCount) * 100)}%
              </p>
            </div>
          </div>
        </div>

        {/* ⏰ TEMPO */}
        <div className="mb-5">
          <div 
            className="px-3 py-2 mb-2 border-4"
            style={{
              backgroundColor: isMinimalist ? '#000' : (isNeutral ? (neutralPalette === 'dark' ? '#2A2A2A' : '#E8E8E8') : colors.blue.main),
              borderColor: isMinimalist ? '#FFF' : (isNeutral ? '#404040' : '#000'),
              boxShadow: isMinimalist ? '4px 4px 0px #FFF' : (isNeutral ? '4px 4px 0px rgba(0,0,0,0.2)' : '4px 4px 0px rgba(0,0,0,0.5)')
            }}
          >
            <h2 
              className="text-base font-bold"
              style={{ 
                fontFamily: THEME.font,
                color: isMinimalist ? '#FFF' : (isNeutral ? (neutralPalette === 'dark' ? '#E0E0E0' : '#202020') : '#000'),
                textShadow: !isMinimalist && !isNeutral ? '2px 2px 0px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              ⏰ TEMPO ({timeAchievements.filter(a => a.unlocked).length}/{timeAchievements.length})
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-2">
            {timeAchievements.map(renderAchievement)}
          </div>
        </div>

        {/* 🔥 CONSISTÊNCIA */}
        <div className="mb-5">
          <div 
            className="px-3 py-2 mb-2 border-4"
            style={{
              backgroundColor: isMinimalist ? '#000' : (isNeutral ? (neutralPalette === 'dark' ? '#2A2A2A' : '#E8E8E8') : colors.orange.main),
              borderColor: isMinimalist ? '#FFF' : (isNeutral ? '#404040' : '#000'),
              boxShadow: isMinimalist ? '4px 4px 0px #FFF' : (isNeutral ? '4px 4px 0px rgba(0,0,0,0.2)' : '4px 4px 0px rgba(0,0,0,0.5)')
            }}
          >
            <h2 
              className="text-base font-bold"
              style={{ 
                fontFamily: THEME.font,
                color: isMinimalist ? '#FFF' : (isNeutral ? (neutralPalette === 'dark' ? '#E0E0E0' : '#202020') : '#000'),
                textShadow: !isMinimalist && !isNeutral ? '2px 2px 0px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              🔥 CONSISTENCIA ({streakAchievements.filter(a => a.unlocked).length}/{streakAchievements.length})
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-2">
            {streakAchievements.map(renderAchievement)}
          </div>
        </div>

        {/* ❓ QUESTÕES */}
        <div className="mb-5">
          <div 
            className="px-3 py-2 mb-2 border-4"
            style={{
              backgroundColor: isMinimalist ? '#000' : (isNeutral ? (neutralPalette === 'dark' ? '#2A2A2A' : '#E8E8E8') : colors.green.main),
              borderColor: isMinimalist ? '#FFF' : (isNeutral ? '#404040' : '#000'),
              boxShadow: isMinimalist ? '4px 4px 0px #FFF' : (isNeutral ? '4px 4px 0px rgba(0,0,0,0.2)' : '4px 4px 0px rgba(0,0,0,0.5)')
            }}
          >
            <h2 
              className="text-base font-bold"
              style={{ 
                fontFamily: THEME.font,
                color: isMinimalist ? '#FFF' : (isNeutral ? (neutralPalette === 'dark' ? '#E0E0E0' : '#202020') : '#000'),
                textShadow: !isMinimalist && !isNeutral ? '2px 2px 0px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              ❓ QUESTOES ({questionsAchievements.filter(a => a.unlocked).length}/{questionsAchievements.length})
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-2">
            {questionsAchievements.map(renderAchievement)}
          </div>
        </div>

        {/* 📚 ORGANIZAÇÃO */}
        <div className="mb-5">
          <div 
            className="px-3 py-2 mb-2 border-4"
            style={{
              backgroundColor: isMinimalist ? '#000' : (isNeutral ? (neutralPalette === 'dark' ? '#2A2A2A' : '#E8E8E8') : colors.purple.main),
              borderColor: isMinimalist ? '#FFF' : (isNeutral ? '#404040' : '#000'),
              boxShadow: isMinimalist ? '4px 4px 0px #FFF' : (isNeutral ? '4px 4px 0px rgba(0,0,0,0.2)' : '4px 4px 0px rgba(0,0,0,0.5)')
            }}
          >
            <h2 
              className="text-base font-bold"
              style={{ 
                fontFamily: THEME.font,
                color: isMinimalist ? '#FFF' : (isNeutral ? (neutralPalette === 'dark' ? '#E0E0E0' : '#202020') : '#000'),
                textShadow: !isMinimalist && !isNeutral ? '2px 2px 0px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              📚 ORGANIZACAO ({orgAchievements.filter(a => a.unlocked).length}/{orgAchievements.length})
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-2">
            {orgAchievements.map(renderAchievement)}
          </div>
        </div>
      </div>
    </div>
  );
}
