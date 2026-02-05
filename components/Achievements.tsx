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
        className="relative p-3 border-4 flex flex-col items-center justify-center gap-1"
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
          minHeight: '100px',
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
        {/* Icon - Larger and bolder */}
        <div 
          className="text-4xl mb-1"
          style={{
            filter: achievement.unlocked ? 'none' : 'grayscale(100%)',
            textShadow: achievement.unlocked 
              ? (isMinimalist ? 'none' : (isNeutral ? 'none' : '2px 2px 0px rgba(0,0,0,0.8)'))
              : 'none'
          }}
        >
          {achievement.icon}
        </div>
        
        {/* Name - Muito mais visível */}
        <div 
          className="text-[11px] font-bold text-center leading-tight px-1"
          style={{ 
            fontFamily: THEME.font,
            color: achievement.unlocked 
              ? (isMinimalist ? '#FFF' : (isNeutral ? (neutralPalette === 'dark' ? '#E0E0E0' : '#202020') : getCategoryColor(achievement.category)))
              : (isMinimalist ? '#888' : (isNeutral ? (neutralPalette === 'dark' ? '#808080' : '#606060') : '#C0C0C0')),
            textShadow: achievement.unlocked && !isMinimalist && !isNeutral 
              ? '1px 1px 0px rgba(0,0,0,0.8)' 
              : 'none',
            WebkitTextStroke: achievement.unlocked && !isMinimalist && !isNeutral ? '0.5px rgba(0,0,0,0.5)' : '0px'
          }}
        >
          {achievement.name.toUpperCase()}
        </div>

        {/* Description - Muito mais visível */}
        <div 
          className="text-[10px] font-bold text-center"
          style={{ 
            fontFamily: THEME.font,
            color: achievement.unlocked 
              ? (isMinimalist ? '#CCC' : (isNeutral ? (neutralPalette === 'dark' ? '#A0A0A0' : '#404040') : '#FFFFFF'))
              : (isMinimalist ? '#666' : (isNeutral ? (neutralPalette === 'dark' ? '#606060' : '#808080') : '#A0A0A0'))
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
            className="absolute inset-0 flex items-center justify-center text-3xl opacity-30 pointer-events-none"
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
        {/* Header Compacto */}
        <div 
          className="p-4 border-4 mb-4"
          style={{
            backgroundColor: isMinimalist ? '#000' : (isNeutral ? (neutralPalette === 'dark' ? '#1A1A1A' : '#E0E0E0') : colors.yellow.main),
            borderColor: isMinimalist ? '#FFF' : (isNeutral ? '#404040' : '#000'),
            boxShadow: isMinimalist ? '8px 8px 0px #FFF' : (isNeutral ? (neutralPalette === 'dark' ? '8px 8px 0px rgba(0,0,0,0.5)' : '8px 8px 0px rgba(0,0,0,0.3)') : '8px 8px 0px rgba(0,0,0,0.6)'),
            imageRendering: 'pixelated' as const
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-2xl font-bold mb-1"
                style={{ 
                  fontFamily: THEME.font,
                  color: isMinimalist ? '#FFF' : (isNeutral ? (neutralPalette === 'dark' ? '#E0E0E0' : '#202020') : '#000'),
                  textShadow: isMinimalist ? 'none' : (isNeutral ? 'none' : '3px 3px 0px rgba(0,0,0,0.3)'),
                  WebkitTextStroke: isMinimalist ? '0px' : (isNeutral ? '0px' : '1px rgba(0,0,0,0.3)')
                }}
              >
                ★ CONQUISTAS ★
              </h1>
              <p 
                className="text-[10px] font-bold"
                style={{ 
                  fontFamily: THEME.font,
                  color: isMinimalist ? '#CCC' : (isNeutral ? (neutralPalette === 'dark' ? '#A0A0A0' : '#606060') : '#000')
                }}
              >
                {unlockedCount}/{totalCount} DESBLOQUEADAS • TIER: {currentTier.name.toUpperCase()}
              </p>
              {nextTier && (
                <p 
                  className="text-[9px] font-bold mt-1"
                  style={{ 
                    fontFamily: THEME.font,
                    color: isMinimalist ? '#AAA' : (isNeutral ? (neutralPalette === 'dark' ? '#808080' : '#808080') : '#000'),
                    opacity: 0.7
                  }}
                >
                  PROXIMO: {nextTier.name.toUpperCase()} ({nextTier.achievementsRequired - unlockedCount} RESTANTES)
                </p>
              )}
            </div>
            
            {/* Progress bar - More retro */}
            <div className="w-40">
              <div 
                className="h-4 border-4 relative"
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
                    backgroundSize: '8px 8px'
                  }}
                />
              </div>
              <p 
                className="text-[8px] text-center mt-1 font-bold"
                style={{ 
                  fontFamily: THEME.font,
                  color: isMinimalist ? '#FFF' : (isNeutral ? (neutralPalette === 'dark' ? '#E0E0E0' : '#202020') : '#000')
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
