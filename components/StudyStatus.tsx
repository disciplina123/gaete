import React, { useMemo } from 'react';
import { Subject } from './StudyMaterials';
import { THEME, getThemeColors } from './RetroUtils';

interface StudyStatusProps {
  subjects: Subject[];
  studyLog: Record<string, number>; // format: "YYYY-MM-DD": minutes
  questionLog: Record<string, { total: number, correct: number }>;
  subjectTimeLog?: Record<number, number>; // format: SubjectID: minutes
  themeMode: 'mario' | 'minimalist' | 'neutral';
  neutralPalette?: 'classic' | 'warm' | 'cool' | 'dark';
  onNavigateToAchievements?: () => void;
}

export default function StudyStatus({ subjects, studyLog, questionLog, subjectTimeLog = {}, themeMode, neutralPalette = 'classic', onNavigateToAchievements }: StudyStatusProps) {
  const colors = getThemeColors(themeMode, neutralPalette);
  const isMinimalist = themeMode === 'minimalist';
  const isNeutral = themeMode === 'neutral';
  
  // State for expanded subjects
  const [expandedSubjects, setExpandedSubjects] = React.useState<Record<number, boolean>>({});

  // Calculate general statistics
  const stats = useMemo(() => {
    // Total hours studied
    const totalMinutes = Object.values(studyLog).reduce((sum, min) => sum + min, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalRemainingMinutes = totalMinutes % 60;

    // Days studied (days with at least 1 minute)
    const daysStudied = Object.values(studyLog).filter(min => min > 0).length;

    // Total Questions (Done & Correct)
    const totalQuestionsDone = Object.values(questionLog).reduce((sum, log) => sum + (log.total || 0), 0);
    const totalQuestionsCorrect = Object.values(questionLog).reduce((sum, log) => sum + (log.correct || 0), 0);

    // Subject Progress (Keep for breakdown list)
    const subjectStats: Record<string, { totalQuests: number; completedQuests: number }> = {};
    subjects.forEach(subject => {
      let subjectTotalQuests = 0;
      let subjectCompletedQuests = 0;
      subject.books.forEach(book => {
        book.chapters.forEach(chapter => {
          chapter.quests.forEach(quest => {
            subjectTotalQuests++;
            if (quest.completed) subjectCompletedQuests++;
          });
        });
      });
      if (subjectTotalQuests > 0) {
        subjectStats[subject.title] = { totalQuests: subjectTotalQuests, completedQuests: subjectCompletedQuests };
      }
    });

    return {
      totalHours,
      totalRemainingMinutes,
      totalMinutes,
      daysStudied,
      totalQuestionsDone,
      totalQuestionsCorrect,
      subjectStats
    };
  }, [subjects, studyLog, questionLog]);

  // Calculate daily average
  const averageMinutesPerDay = stats.daysStudied > 0 
    ? Math.round(stats.totalMinutes / stats.daysStudied) 
    : 0;

  // Calculate streak
  const currentStreak = useMemo(() => {
    const dates = Object.keys(studyLog).sort().reverse();
    if (dates.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < dates.length; i++) {
      const dateToCheck = new Date(today);
      dateToCheck.setDate(dateToCheck.getDate() - i);
      const dateStr = dateToCheck.toLocaleDateString('en-CA');
      
      // Check if logged either time OR questions
      const hasTime = studyLog[dateStr] && studyLog[dateStr] > 0;
      const hasQuestions = questionLog[dateStr] && questionLog[dateStr].total > 0;

      if (hasTime || hasQuestions) {
        streak++;
      } else {
        if (i === 0 && dateStr !== dates[0]) {
             const lastLogDate = new Date(dates[0]);
             const diff = today.getTime() - lastLogDate.getTime();
             const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
             if (diffDays > 1) break; 
             i--; 
             continue; 
        }
        break;
      }
    }
    return streak;
  }, [studyLog, questionLog]);

  const formatHours = (totalMins: number) => {
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      if (h > 0) return `${h}h ${m}m`;
      return `${m}m`;
  };
  
  // Toggle subject expansion
  const toggleSubject = (subjectId: number) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };
  
  // Calculate detailed stats for a subject
  const getSubjectDetailedStats = (subject: Subject) => {
    const sStats = stats.subjectStats[subject.title] || { totalQuests: 0, completedQuests: 0 };
    const percentage = sStats.totalQuests > 0 
      ? Math.round((sStats.completedQuests / sStats.totalQuests) * 100) 
      : 0;
    const displayTime = subjectTimeLog[subject.id] || 0;
    const hours = Math.floor(displayTime / 60);
    const minutes = displayTime % 60;
    
    return {
      percentage,
      totalQuests: sStats.totalQuests,
      completedQuests: sStats.completedQuests,
      hours,
      minutes,
      totalMinutes: displayTime
    };
  };

  // Styles helpers
  const cardStyle = (bgColor: string) => ({
    backgroundColor: isMinimalist ? '#000' : bgColor,
    borderColor: isMinimalist ? '#FFF' : '#000',
    color: isMinimalist ? '#FFF' : (isNeutral ? '#FFF' : '#000'), // White text for colored blocks
    borderWidth: '4px',
    borderStyle: 'solid',
    boxShadow: isMinimalist ? '4px 4px 0 #FFF' : 'none'
  });

  return (
    <div style={{ 
      width: '95%',
      maxWidth: '950px',
      maxHeight: '90vh',
      padding: '2rem',
      overflowY: 'auto',
      backgroundColor: colors.ui.background,
      border: `4px solid ${isMinimalist ? '#FFF' : '#000'}`,
      boxShadow: isMinimalist ? '8px 8px 0px #FFF' : (isNeutral ? '8px 8px 0px rgba(0,0,0,0.1)' : '8px 8px 0px rgba(0,0,0,0.5)'),
    }} className="custom-scrollbar">
      {/* Header - Course Clear Style */}
      <div className="text-center mb-10 relative">
         {/* Decorative bolts in corners */}
        {!isMinimalist && !isNeutral && (
            <>
                <div className="absolute top-0 left-0 w-4 h-4 bg-black rounded-full border-2 border-gray-600"></div>
                <div className="absolute top-0 right-0 w-4 h-4 bg-black rounded-full border-2 border-gray-600"></div>
            </>
        )}

        <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ 
          fontFamily: THEME.fonts.pixel,
          color: colors.yellow.main,
          letterSpacing: '2px',
          textShadow: (isMinimalist || isNeutral) ? 'none' : '4px 4px 0px #000',
          WebkitTextStroke: (isMinimalist || isNeutral) ? '0px' : '2px #000'
        }}>
          STATUS
        </h1>
        
        {/* Achievements Button */}
        {onNavigateToAchievements && (
          <div className="flex justify-center mt-4">
            <button
              onClick={onNavigateToAchievements}
              className="px-6 py-3 border-4 font-bold text-lg transition-transform hover:scale-105 active:scale-95"
              style={{
                fontFamily: THEME.fonts.pixel,
                backgroundColor: isMinimalist ? '#000' : (isNeutral ? (neutralPalette === 'dark' ? '#2A2A2A' : '#E0E0E0') : colors.yellow.main),
                borderColor: isMinimalist ? '#FFF' : (isNeutral ? '#404040' : '#000'),
                color: isMinimalist ? '#FFF' : (isNeutral ? (neutralPalette === 'dark' ? '#E0E0E0' : '#202020') : '#000'),
                boxShadow: isMinimalist ? '4px 4px 0px #FFF' : (isNeutral ? '4px 4px 0px rgba(0,0,0,0.2)' : '4px 4px 0px rgba(0,0,0,0.4)')
              }}
            >
              🏆 VER CONQUISTAS 🏆
            </button>
          </div>
        )}
      </div>

      {/* General Statistics - Block Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Total Time - Blue Block */}
        <div className="p-4 transform hover:-translate-y-1 transition-transform" style={cardStyle(colors.blue.main)}>
          <div className="flex flex-col items-center">
             {/* Pocket Watch Icon */}
            <div className="mb-3">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Minimalist: White outlines only */}
                  <path d="M12 2C12 2 14 2 14 4V6H10V4C10 2 12 2 12 2Z" fill={isMinimalist ? "none" : "#DAA520"} stroke={isMinimalist ? "#FFF" : "black"} strokeWidth="1"/>
                  <circle cx="12" cy="14" r="8" fill={isMinimalist ? "none" : (isNeutral ? '#E0E0E0' : '#FFD700')} stroke={isMinimalist ? "#FFF" : "black"} strokeWidth="2"/>
                  {!isMinimalist && !isNeutral && <circle cx="12" cy="14" r="6" fill="#FFFFE0" stroke="black" strokeWidth="1"/>}
                  <path d="M12 14L12 10" stroke={isMinimalist ? "#FFF" : "black"} strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 14L15 14" stroke={isMinimalist ? "#FFF" : "black"} strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-xs font-bold mb-1" style={{ fontFamily: THEME.font, color: '#FFF' }}>TOTAL PLAY</h3>
            <p className="text-xl font-bold" style={{ fontFamily: THEME.font, color: '#FFF', textShadow: (isMinimalist || isNeutral) ? 'none' : '2px 2px 0 #000' }}>
                {stats.totalHours}<span className="text-sm">h</span> {stats.totalRemainingMinutes}<span className="text-sm">m</span>
            </p>
          </div>
        </div>

        {/* Streak - Red Block */}
        <div className="p-4 transform hover:-translate-y-1 transition-transform" style={cardStyle(colors.red.main)}>
          <div className="flex flex-col items-center">
             {/* Fire Flower Icon */}
            <div className="mb-3">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="6" fill={isMinimalist ? "none" : (isNeutral ? "#909090" : "#FF4500")} stroke={isMinimalist ? "#FFF" : "black"} strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" fill={isMinimalist ? "none" : (isNeutral ? "#B0B0B0" : "#FFD700")} stroke={isMinimalist ? "#FFF" : "black"} strokeWidth="1"/>
                    <path d="M12 6V2M12 22V18M6 12H2M22 12H18" stroke={isMinimalist ? "#FFF" : "black"} strokeWidth="2"/>
                </svg>
            </div>
            <h3 className="text-xs font-bold mb-1" style={{ fontFamily: THEME.font, color: '#FFF' }}>STREAK</h3>
            <p className="text-xl font-bold" style={{ fontFamily: THEME.font, color: '#FFF', textShadow: (isMinimalist || isNeutral) ? 'none' : '2px 2px 0 #000' }}>
                {currentStreak} DAYS
            </p>
          </div>
        </div>

        {/* QUESTIONS - Green Block (UPDATED) */}
        <div className="p-4 transform hover:-translate-y-1 transition-transform" style={cardStyle(colors.green.main)}>
          <div className="flex flex-col items-center">
             {/* Checkbox / Flag Icon */}
            <div className="mb-3">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill={isMinimalist ? "#FFF" : (isNeutral ? "#E0E0E0" : "#32CD32")} stroke={isMinimalist ? "none" : "black"} strokeWidth={isMinimalist ? "0" : "1"}/>
                </svg>
            </div>
            <h3 className="text-xs font-bold mb-1" style={{ fontFamily: THEME.font, color: '#FFF' }}>QUESTIONS</h3>
            <div className="flex flex-col items-center">
                <p className="text-lg font-bold" style={{ fontFamily: THEME.font, color: '#FFF', textShadow: (isMinimalist || isNeutral) ? 'none' : '2px 2px 0 #000' }}>
                    {stats.totalQuestionsDone} DONE
                </p>
                <p className="text-[10px] font-bold opacity-90" style={{ fontFamily: THEME.font, color: '#FFF' }}>
                    ({stats.totalQuestionsCorrect} CORRECT)
                </p>
            </div>
          </div>
        </div>

        {/* Avg - Yellow Block */}
        <div className="p-4 transform hover:-translate-y-1 transition-transform" style={cardStyle(colors.yellow.main)}>
          <div className="flex flex-col items-center">
             {/* Graph Icon */}
            <div className="mb-3">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M4 20H20" stroke={isMinimalist ? "#FFF" : "black"} strokeWidth="2"/>
                    <rect x="6" y="12" width="3" height="8" fill={isMinimalist ? "none" : (isNeutral ? "#808080" : "#FF6347")} stroke={isMinimalist ? "#FFF" : "black"} strokeWidth="1"/>
                    <rect x="11" y="8" width="3" height="12" fill={isMinimalist ? "none" : (isNeutral ? "#606060" : "#4169E1")} stroke={isMinimalist ? "#FFF" : "black"} strokeWidth="1"/>
                    <rect x="16" y="4" width="3" height="16" fill={isMinimalist ? "none" : (isNeutral ? "#404040" : "#32CD32")} stroke={isMinimalist ? "#FFF" : "black"} strokeWidth="1"/>
                </svg>
            </div>
            <h3 className="text-xs font-bold mb-1" style={{ fontFamily: THEME.font, color: isMinimalist || isNeutral ? '#FFF' : '#000' }}>AVG/DAY</h3>
            <p className="text-xl font-bold" style={{ fontFamily: THEME.font, color: isMinimalist ? '#FFF' : (themeMode === 'mario' ? '#000' : '#000'), textShadow: (isMinimalist || isNeutral) ? 'none' : (themeMode === 'mario' ? '2px 2px 0 #FFF' : '2px 2px 0 #000') }}>
                {averageMinutesPerDay}<span className="text-sm">m</span>
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown per Subject - REDESIGNED "LEVEL CARD" STYLE */}
      <div className="relative pt-6 pb-2">
        <div className="absolute top-0 left-0 px-3 py-1 -translate-y-1/2 z-10 border-4 border-black bg-white" 
             style={{ 
                 backgroundColor: isMinimalist ? '#000' : (isNeutral ? '#FFF' : colors.yellow.main),
                 borderColor: isMinimalist ? '#FFF' : '#000',
                 boxShadow: isMinimalist ? 'none' : '4px 4px 0 rgba(0,0,0,0.3)'
             }}>
            <h3 className="text-xl font-bold tracking-widest uppercase" 
                style={{ 
                    fontFamily: THEME.font,
                    color: isMinimalist ? '#FFF' : (isNeutral ? '#000' : '#000')
                }}>
                WORLD PROGRESS
            </h3>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6">
            {subjects.length === 0 && (
                <div className="border-4 border-dashed p-8 text-center rounded-xl" style={{ borderColor: isMinimalist ? '#FFF' : '#000' }}>
                    <p className="text-gray-500 py-4" style={{ fontFamily: THEME.font }}>NO WORLDS DISCOVERED YET.</p>
                </div>
            )}

            {subjects.map((subject, subjectIndex) => {
                const detailedStats = getSubjectDetailedStats(subject);
                const isExpanded = expandedSubjects[subject.id];
                
                return (
                    <div key={subject.id} 
                         className="relative border-4 rounded-xl transition-all"
                         style={{ 
                             backgroundColor: isMinimalist ? '#111' : (isNeutral ? '#F5F5F5' : '#FFFFCE'),
                             borderColor: isMinimalist ? '#FFF' : '#000',
                             boxShadow: isMinimalist ? '4px 4px 0 #FFF' : '8px 8px 0 rgba(0,0,0,0.4)'
                         }}>
                        
                        {/* Clickable Header */}
                        <button
                            onClick={() => toggleSubject(subject.id)}
                            className="w-full p-4 text-left transition-transform hover:-translate-y-1"
                        >
                            {/* Header Row */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-lg md:text-xl truncate pr-2 uppercase drop-shadow-sm" 
                                          style={{ fontFamily: THEME.font, color: isMinimalist ? '#FFF' : '#000' }}>
                                        {subject.title}
                                    </span>
                                    {/* Expand/Collapse Icon */}
                                    <svg 
                                        width="20" 
                                        height="20" 
                                        viewBox="0 0 24 24" 
                                        fill="none"
                                        className="transition-transform duration-300"
                                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                    >
                                        <path d="M7 10L12 15L17 10" stroke={isMinimalist ? '#FFF' : '#000'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                        </button>
                        
                        {/* Expanded Statistics Panel */}
                        {isExpanded && (
                            <div className="px-4 pb-4 pt-2 border-t-4" style={{ borderColor: isMinimalist ? '#FFF' : '#000' }}>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                    {/* Percentage Card */}
                                    <div className="p-3 border-2 rounded-lg text-center" style={{
                                        backgroundColor: isMinimalist ? '#000' : (isNeutral ? '#E8E8E8' : '#FFE4B5'),
                                        borderColor: isMinimalist ? '#FFF' : '#000'
                                    }}>
                                        <div className="text-xs font-bold mb-2" style={{ fontFamily: THEME.font, color: isMinimalist ? '#AAA' : '#666' }}>
                                            COMPLETION
                                        </div>
                                        <div className="text-3xl font-bold" style={{ 
                                            fontFamily: THEME.font, 
                                            color: isMinimalist ? '#FFF' : (isNeutral ? '#000' : colors.green.main),
                                            textShadow: (isMinimalist || isNeutral) ? 'none' : '2px 2px 0 rgba(0,0,0,0.2)'
                                        }}>
                                            {detailedStats.percentage}%
                                        </div>
                                    </div>
                                    
                                    {/* Total Hours Card */}
                                    <div className="p-3 border-2 rounded-lg text-center" style={{
                                        backgroundColor: isMinimalist ? '#000' : (isNeutral ? '#E8E8E8' : '#B0E0E6'),
                                        borderColor: isMinimalist ? '#FFF' : '#000'
                                    }}>
                                        <div className="text-xs font-bold mb-2" style={{ fontFamily: THEME.font, color: isMinimalist ? '#AAA' : '#666' }}>
                                            TOTAL TIME
                                        </div>
                                        <div className="text-2xl font-bold" style={{ 
                                            fontFamily: THEME.font, 
                                            color: isMinimalist ? '#FFF' : (isNeutral ? '#000' : '#4080FF')
                                        }}>
                                            {detailedStats.hours > 0 ? `${detailedStats.hours}h ` : ''}{detailedStats.minutes}m
                                        </div>
                                    </div>
                                    
                                    {/* Quests Progress Card */}
                                    <div className="p-3 border-2 rounded-lg text-center col-span-2 md:col-span-1" style={{
                                        backgroundColor: isMinimalist ? '#000' : (isNeutral ? '#E8E8E8' : '#FFB6C1'),
                                        borderColor: isMinimalist ? '#FFF' : '#000'
                                    }}>
                                        <div className="text-xs font-bold mb-2" style={{ fontFamily: THEME.font, color: isMinimalist ? '#AAA' : '#666' }}>
                                            QUESTS CLEARED
                                        </div>
                                        <div className="text-2xl font-bold" style={{ 
                                            fontFamily: THEME.font, 
                                            color: isMinimalist ? '#FFF' : (isNeutral ? '#000' : '#FF9020')
                                        }}>
                                            {detailedStats.completedQuests}/{detailedStats.totalQuests}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Summary Text */}
                                <div className="mt-4 p-3 border-2 rounded-lg" style={{
                                    backgroundColor: isMinimalist ? '#1a1a1a' : (isNeutral ? '#F5F5F5' : '#FFF'),
                                    borderColor: isMinimalist ? '#FFF' : '#000'
                                }}>
                                    <p className="text-xs text-center" style={{ 
                                        fontFamily: THEME.font, 
                                        color: isMinimalist ? '#CCC' : '#666',
                                        lineHeight: '1.6'
                                    }}>
                                        {detailedStats.completedQuests === 0 
                                            ? "No quests cleared yet. Start your journey!"
                                            : detailedStats.percentage === 100
                                                ? "🎉 WORLD COMPLETE! You've mastered this subject!"
                                                : `You've cleared ${detailedStats.completedQuests} quest${detailedStats.completedQuests !== 1 ? 's' : ''} and spent ${formatHours(detailedStats.totalMinutes)} studying. ${detailedStats.totalQuests - detailedStats.completedQuests} quest${(detailedStats.totalQuests - detailedStats.completedQuests) !== 1 ? 's' : ''} remaining!`
                                        }
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>

    </div>
  );
}
