import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { RetroButton, THEME, play8BitSound, getThemeColors } from './RetroUtils';
import type { Subject } from './StudyMaterials';

const DEFAULT_TIME = 25 * 60; // 25 minutos

interface PixelTimerProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  onStudyUpdate: (minutes: number, questions?: number, correct?: number, subjectId?: number) => void;
  themeMode: 'mario' | 'minimalist' | 'neutral';
  neutralPalette?: 'classic' | 'warm' | 'cool' | 'dark';
  timerPosition: 'center' | 'top-left' | 'bottom-right';
}

export default function PixelTimer({ subjects, setSubjects, onStudyUpdate, themeMode, timerPosition: timerPositionProp , neutralPalette = 'classic' }: PixelTimerProps) {
  // Estados do Timer
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [initialTime, setInitialTime] = useState(DEFAULT_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Novo estado de pausa
  const [isBreakMode, setIsBreakMode] = useState(false);
  
  // Estado de Minimização
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Refs
  const timerRef = useRef<HTMLDivElement>(null);

  // Função para calcular posição baseada na configuração
  const getPositionStyle = () => {
    if (!isMinimized) return {};
    
    switch (timerPositionProp) {
      case 'center':
        return {
          position: 'fixed' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50
        };
      case 'top-left':
        return {
          position: 'fixed' as const,
          top: '20px',
          left: '20px',
          zIndex: 50
        };
      case 'bottom-right':
        return {
          position: 'fixed' as const,
          bottom: '20px',
          right: '20px',
          zIndex: 50
        };
      default:
        return {
          position: 'fixed' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50
        };
    }
  };


  // Estados de Missão e Modais
  const [selectedQuestId, setSelectedQuestId] = useState<number | null>(null);
  const [currentMissionName, setCurrentMissionName] = useState<string>('NO MISSION');
  
  // Controle de Modais
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showBreakMenu, setShowBreakMenu] = useState(false);

  // Stats e Conclusão
  const [isMissionCompleted, setIsMissionCompleted] = useState(false);
  const [sessionStats, setSessionStats] = useState({ total: '', correct: '' });

  // Armazena o tempo decorrido da sessão atual para registrar
  const [lastSessionTime, setLastSessionTime] = useState(0);

  // Estado local para controle de expansão no modal
  const [expandedSubjectIds, setExpandedSubjectIds] = useState<number[]>([]);

  const colors = getThemeColors(themeMode, neutralPalette);
  const isMinimalist = themeMode === 'minimalist';
  const isNeutral = themeMode === 'neutral';

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Tempo acabou
      handleStop();
      play8BitSound('alarm');
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // --- FIM DA LÓGICA DE TIMER ---

  // Formata MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const adjustTime = (amount: number) => {
    if (isActive || isPaused) return;
    const newTime = Math.max(60, initialTime + amount);
    setInitialTime(newTime);
    setTimeLeft(newTime);
  };

  // --- LÓGICA DE START / PAUSE / RESUME ---
  const handleMainButtonClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isPaused) {
        handleResume();
    } else if (isActive) {
        handlePause();
    } else {
        // Se está parado, abre modal de seleção
        play8BitSound('open');
        setShowSelectModal(true);
    }
  };

  const handlePause = () => {
      setIsActive(false);
      setIsPaused(true);
      play8BitSound('pause'); // Som de pausa
  };

  const handleResume = () => {
      setIsActive(true);
      setIsPaused(false);
      play8BitSound('jump'); // Som de retomar
  };

  const confirmStart = () => {
    if (!selectedQuestId) {
        play8BitSound('stomp');
        alert("SELECT A QUEST FIRST!");
        return;
    }

    // Busca os detalhes da missão selecionada
    let name = "UNKNOWN MISSION";
    let found = false;

    for (const sub of subjects) {
        for (const book of sub.books) {
            for (const chap of book.chapters) {
                const quest = chap.quests.find(q => q.id === selectedQuestId);
                if (quest) {
                    name = `${sub.title}: ${quest.text}`; 
                    found = true;
                    break;
                }
            }
            if(found) break;
        }
        if(found) break;
    }
    
    setCurrentMissionName(name);
    setIsBreakMode(false);
    setIsPaused(false);
    
    // Inicia
    play8BitSound('powerup');
    setShowSelectModal(false);
    setIsActive(true);
  };

  const toggleSubject = (id: number) => {
    play8BitSound('jump');
    setExpandedSubjectIds(prev => 
      prev.includes(id) 
        ? prev.filter(subjectId => subjectId !== id) 
        : [...prev, id]
    );
  };

  // --- LÓGICA DE STOP (FINALIZAR SESSÃO) ---
  const handleStop = () => {
      setIsActive(false);
      setIsPaused(false);

      // Calcular tempo estudado (em segundos)
      const elapsedSeconds = initialTime - timeLeft;
      
      // Se não for modo descanso e tiver passado pelo menos 1 minuto (para evitar clicks acidentais)
      if (!isBreakMode && elapsedSeconds > 5) {
          const elapsedMinutes = Math.ceil(elapsedSeconds / 60);
          
          // Encontrar o Subject ID associado à Quest selecionada
          let activeSubjectId: number | undefined;
          if (selectedQuestId) {
            const foundSub = subjects.find(s => 
              s.books.some(b => 
                b.chapters.some(c => 
                  c.quests.some(q => q.id === selectedQuestId)
                )
              )
            );
            if (foundSub) activeSubjectId = foundSub.id;
          }

          onStudyUpdate(elapsedMinutes, 0, 0, activeSubjectId); // Registra tempo e associa à matéria
          setLastSessionTime(elapsedMinutes);
      } else {
          setLastSessionTime(0);
      }
      
      // Se estava em modo descanso, apenas reseta
      if (isBreakMode) {
          play8BitSound('pipe');
          setIsBreakMode(false);
          setInitialTime(DEFAULT_TIME);
          setTimeLeft(DEFAULT_TIME);
          setCurrentMissionName('NO MISSION');
          return;
      }

      play8BitSound('pipe');
      setShowResultModal(true);
  };

  // --- LÓGICA DE FINALIZAR TAREFA E ABRIR MENU DE DESCANSO ---
  const submitResults = () => {
      // Registrar estatísticas de questões (se houver)
      const totalQ = parseInt(sessionStats.total) || 0;
      const correctQ = parseInt(sessionStats.correct) || 0;
      
      if (totalQ > 0 || correctQ > 0) {
          onStudyUpdate(0, totalQ, correctQ);
      }

      // Se marcou como completo, atualiza o StudyMaterials
      if (isMissionCompleted && selectedQuestId) {
          setSubjects(prev => prev.map(sub => ({
              ...sub,
              books: sub.books.map(book => ({
                  ...book,
                  chapters: book.chapters.map(chap => ({
                      ...chap,
                      quests: chap.quests.map(quest => 
                          quest.id === selectedQuestId ? { ...quest, completed: true } : quest
                      )
                  }))
              }))
          })));
      }
      
      play8BitSound('1up'); // Som de vida extra ao completar
      setShowResultModal(false);
      setIsMissionCompleted(false); // Reset Checkbox
      setSessionStats({ total: '', correct: '' }); // Reset Stats
      setSelectedQuestId(null); // Reseta a missão
      setCurrentMissionName('NO MISSION');
      
      // Abre o menu de descanso
      setShowBreakMenu(true);
  };

  // --- LÓGICA DE INICIAR DESCANSO ---
  const startBreak = (minutes: number) => {
      const breakTime = minutes * 60;
      setInitialTime(breakTime);
      setTimeLeft(breakTime);
      setIsBreakMode(true);
      setIsPaused(false);
      setCurrentMissionName("RECOVER ENERGY");
      setShowBreakMenu(false);
      setIsActive(true);
      play8BitSound('powerup');
  };

  // --- PULAR DESCANSO ---
  const skipBreak = () => {
      setInitialTime(DEFAULT_TIME);
      setTimeLeft(DEFAULT_TIME);
      setIsBreakMode(false);
      setIsPaused(false);
      setShowBreakMenu(false);
      play8BitSound('jump');
  };

  const resetTimer = () => {
    if (isActive || isPaused) return;
    play8BitSound('break');
    setTimeLeft(initialTime);
  };

  const toggleMinimize = (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      play8BitSound('click');
      
      // Se estiver restaurando (maximizando), reseta o estilo inline para não conflitar com o layout normal
      if (isMinimized && timerRef.current) {
          timerRef.current.style.position = '';
          timerRef.current.style.left = '';
          timerRef.current.style.top = '';
          timerRef.current.style.width = '';
      }
      
      setIsMinimized(!isMinimized);
  };

  // --- VISUAL ---
  const progressPercentage = Math.max(0, (timeLeft / initialTime) * 100);

  // Cores da Barra de Energia
  let barColor = isMinimalist ? '#FFFFFF' : '#FFDE00';
  if (isNeutral) {
    barColor = neutralPalette === 'dark' ? '#808080' : '#C0C0C0';
  }

  if (!isMinimalist) {
      if (isBreakMode) {
        barColor = isNeutral 
          ? (neutralPalette === 'dark' ? '#80B080' : '#90B090')
          : '#40FF40';
      } else if (progressPercentage < 15) {
        barColor = isNeutral 
          ? (neutralPalette === 'dark' ? '#C07070' : '#B08080')
          : '#FF3030';
      }
  }
  
  const hasQuests = subjects.some(s => s.books.some(b => b.chapters.some(c => c.quests.length > 0)));

  return (
    <div 
        ref={timerRef}
        className={`flex flex-col items-center justify-center ${isMinimized ? '' : 'p-4 w-full max-w-3xl animate-in fade-in zoom-in duration-300'} relative select-none`}
        style={getPositionStyle()}
    >
      
      {/* --- MODAL DE SELEÇÃO DE MISSÃO --- */}
      {showSelectModal && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-1 w-full max-w-2xl animate-in zoom-in duration-200 pointer-events-auto"
             style={{ 
                 backgroundColor: colors.ui.background, 
                 border: `4px solid ${isMinimalist ? '#FFF' : '#000'}`, 
                 boxShadow: isMinimalist ? '8px 8px 0px #FFF' : (isNeutral ? '8px 8px 0px rgba(0,0,0,0.1)' : '8px 8px 0px rgba(0,0,0,0.5)') 
             }}>
            {/* Modal Content ... (No changes here) */}
            <div className="flex flex-col gap-4 p-4 max-h-[80vh]">
                <h3 className="text-center text-lg mb-2" style={{ fontFamily: THEME.font, color: isMinimalist ? '#FFF' : '#000' }}>
                    SELECT YOUR QUEST
                </h3>
                
                <div className="border-4 p-2 overflow-y-auto custom-scrollbar flex-1 min-h-[300px]"
                     style={{ 
                         borderColor: isMinimalist ? '#FFF' : (isNeutral ? '#808080' : '#000'),
                         backgroundColor: isMinimalist ? '#000' : (isNeutral ? '#F5F5F5' : '#fff')
                     }}>
                    {!hasQuests && (
                        <div className="text-center mt-10 text-xs" style={{ fontFamily: THEME.font, color: isMinimalist ? '#FFF' : '#6b7280' }}>
                            NO QUESTS AVAILABLE.<br/>GO TO MATERIALS TO ADD TASKS.
                        </div>
                    )}

                    {subjects.map(subject => {
                        const subjectHasQuests = subject.books.some(b => b.chapters.some(c => c.quests.length > 0));
                        if (!subjectHasQuests) return null;

                        const isExpanded = expandedSubjectIds.includes(subject.id);

                        return (
                            <div key={subject.id} className="mb-4">
                                <div 
                                    onClick={() => toggleSubject(subject.id)}
                                    className="cursor-pointer flex items-center select-none transition-colors p-2" 
                                    style={{ 
                                        fontFamily: THEME.font, 
                                        backgroundColor: isMinimalist ? (isExpanded ? '#333' : '#000') : (isNeutral ? (isExpanded ? '#E0E0E0' : '#D0D0D0') : (isExpanded ? '#FFFFCE' : '#F0F0F0')), 
                                        borderBottom: `2px solid ${isMinimalist ? '#FFF' : '#000'}`,
                                        color: isMinimalist ? '#FFF' : '#000'
                                    }}
                                >
                                    <span className="mr-2 text-[10px]">{isExpanded ? '▼' : '▶'}</span>
                                    <span className="text-xs font-bold">{subject.title}</span>
                                </div>
                                
                                {isExpanded && (
                                    <div className="flex flex-col gap-1 animate-in slide-in-from-top-1 duration-150 p-2">
                                        {subject.books.flatMap(book => 
                                            book.chapters.flatMap(chapter => 
                                                chapter.quests.map(quest => (
                                                    <div 
                                                        key={quest.id}
                                                        onClick={() => {
                                                            play8BitSound('click');
                                                            setSelectedQuestId(quest.id);
                                                        }}
                                                        className={`
                                                            group cursor-pointer p-2 flex items-center gap-3 transition-all border-2
                                                            ${selectedQuestId === quest.id 
                                                                ? (isMinimalist ? 'bg-white border-white translate-x-2 text-black' : (isNeutral ? 'bg-[#A0A0A0] border-black translate-x-2 text-white' : 'bg-[#E09040] border-black translate-x-2 text-white')) 
                                                                : 'bg-transparent border-transparent hover:border-gray-200'
                                                            }
                                                        `}
                                                        style={ isMinimalist && selectedQuestId !== quest.id ? { color: '#FFF' } : (isNeutral && selectedQuestId !== quest.id ? { color: '#000' } : {}) }
                                                    >
                                                        <div className={`
                                                            w-4 h-4 border-2 flex-shrink-0 flex items-center justify-center
                                                            ${selectedQuestId === quest.id ? (isMinimalist ? 'border-black' : 'border-white') : (isMinimalist ? 'border-white' : 'border-black')}
                                                            ${quest.completed ? (isMinimalist ? 'bg-black' : (isNeutral ? 'bg-[#90B090]' : 'bg-[#00D020]')) : (isMinimalist ? 'bg-transparent' : 'bg-white')}
                                                        `}>
                                                            {quest.completed && <div className={`w-2 h-2 ${isMinimalist ? 'bg-white' : 'bg-white'}`} />}
                                                        </div>

                                                        <div className="flex-1 flex flex-col">
                                                            <span 
                                                                className={`text-xs leading-tight ${quest.completed ? 'line-through opacity-70' : ''}`}
                                                                style={{ fontFamily: THEME.font }}
                                                            >
                                                                {quest.text}
                                                            </span>
                                                        </div>

                                                        <div className={`
                                                            text-[8px] text-right uppercase
                                                            ${selectedQuestId === quest.id ? (isMinimalist ? 'text-black' : 'text-white') : 'text-gray-500'}
                                                        `} style={{ fontFamily: THEME.font }}>
                                                            {chapter.title}
                                                        </div>
                                                    </div>
                                                ))
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center gap-4 mt-2">
                    <RetroButton onClick={() => setShowSelectModal(false)} colorType="red" size="md" title="Cancel" sound="pipe" themeMode={themeMode}                neutralPalette={neutralPalette}>                        CANCEL                    </RetroButton>                    <RetroButton onClick={confirmStart} colorType="green" size="md" title="Start Quest" sound="coin" themeMode={themeMode}
                neutralPalette={neutralPalette}
            >
                        GO!
                    </RetroButton>
                </div>
            </div>
        </div>
      )}

      {showResultModal && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 border-4 border-black p-1 w-full max-w-lg animate-in slide-in-from-top duration-300 pointer-events-auto"
             style={{ backgroundColor: colors.ui.background, boxShadow: '8px 8px 0px rgba(0,0,0,0.5)', borderColor: isMinimalist ? '#FFF' : '#000' }}>
            <div className="p-6 flex flex-col gap-6 items-center">
                <h3 
                    className="text-center text-3xl mb-2 tracking-wide w-full" 
                    style={{ 
                        fontFamily: THEME.font, 
                        color: isMinimalist ? '#FFF' : (isNeutral ? '#808080' : '#FFD700'), 
                        textShadow: (isMinimalist || isNeutral) ? 'none' : '3px 3px 0 #000',
                        WebkitTextStroke: isMinimalist ? '0px' : '1px #000',
                        letterSpacing: '0.05em'
                    }}
                >
                    COURSE CLEAR!
                </h3>

                {lastSessionTime > 0 && (
                     <div className="text-center border-2 border-black p-2 w-full" style={{ backgroundColor: isMinimalist ? '#000' : (isNeutral ? '#A0B0C0' : '#5c94fc'), borderColor: isMinimalist ? '#FFF' : '#000' }}>
                        <p className="text-xs text-white" style={{ fontFamily: THEME.font, textShadow: isMinimalist ? 'none' : '1px 1px 0 #000' }}>
                            SESSION TIME: {lastSessionTime} MIN ADDED!
                        </p>
                     </div>
                )}
                
                <div className="flex gap-4 w-full px-4 border-b-2 border-black/10 pb-4">
                    <div className="flex-1">
                        <label className="block text-[10px] mb-1 text-center" style={{ fontFamily: THEME.font, color: isMinimalist ? '#FFF' : '#6b7280' }}>QUESTIONS DONE</label>
                        <input 
                            type="number" 
                            value={sessionStats.total}
                            onChange={(e) => setSessionStats({...sessionStats, total: e.target.value})}
                            placeholder="0"
                            className="w-full p-2 border-2 text-center font-bold focus:outline-none transition-colors text-xl placeholder-gray-400"
                            style={{ 
                                fontFamily: THEME.font,
                                backgroundColor: isMinimalist ? '#000' : '#FFF',
                                color: isMinimalist ? '#FFF' : '#000',
                                borderColor: isMinimalist ? '#FFF' : '#000'
                            }}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-[10px] mb-1 text-center" style={{ fontFamily: THEME.font, color: isMinimalist ? '#FFF' : '#6b7280' }}>CORRECT</label>
                        <input 
                            type="number" 
                            value={sessionStats.correct}
                            onChange={(e) => setSessionStats({...sessionStats, correct: e.target.value})}
                            placeholder="0"
                            className="w-full p-2 border-2 text-center font-bold focus:outline-none transition-colors text-xl placeholder-gray-400"
                            style={{ 
                                fontFamily: THEME.font,
                                backgroundColor: isMinimalist ? '#000' : '#FFF',
                                color: isMinimalist ? '#FFF' : '#000',
                                borderColor: isMinimalist ? '#FFF' : '#000'
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4 w-full">
                    <p 
                        className="text-center text-sm leading-relaxed" 
                        style={{ fontFamily: THEME.font, color: isMinimalist ? '#FFF' : '#000' }}
                    >
                        DID YOU COMPLETE THE TASK?
                    </p>
                    
                    <div 
                        onClick={() => {
                            play8BitSound('click');
                            setIsMissionCompleted(!isMissionCompleted);
                        }}
                        className="flex items-center gap-4 cursor-pointer group hover:scale-105 transition-transform"
                    >
                        <div className={`
                            w-10 h-10 border-4 border-black flex items-center justify-center transition-all bg-white shadow-[4px_4px_0_rgba(0,0,0,0.2)]
                            ${isMissionCompleted ? (isMinimalist ? 'bg-black' : (isNeutral ? 'bg-[#90B090]' : 'bg-[#00D020]')) : ''}
                        `}
                        style={{ borderColor: isMinimalist ? '#FFF' : '#000', backgroundColor: isMinimalist ? '#000' : '#fff', boxShadow: isMinimalist ? '4px 4px 0 #FFF' : undefined }}
                        >
                            {isMissionCompleted && (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 12L10 17L19 8" stroke={isMinimalist || isNeutral ? '#FFF' : '#000'} strokeWidth="4" strokeLinecap="square" style={{ shapeRendering: 'crispEdges' }}/>
                                </svg>
                            )}
                        </div>
                        
                        <span 
                            className="text-xl select-none" 
                            style={{ 
                                fontFamily: THEME.font, 
                                color: isMissionCompleted ? (isMinimalist ? '#FFF' : (isNeutral ? '#90B090' : '#00D020')) : '#888',
                                textShadow: (isMinimalist || isNeutral) ? 'none' : '2px 2px 0 #000'
                            }}
                        >
                            YES!
                        </span>
                    </div>
                </div>

                <div className="mt-2 w-full">
                    <RetroButton onClick={submitResults} colorType="blue" size="lg" title="Finish" sound="coin" className="w-full" themeMode={themeMode}
                neutralPalette={neutralPalette}
            >
                        FINISH
                    </RetroButton>
                </div>
            </div>
        </div>
      )}

      {showBreakMenu && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 border-4 border-black p-1 w-full max-w-3xl animate-in zoom-in duration-200 pointer-events-auto"
             style={{ backgroundColor: colors.ui.background, boxShadow: '8px 8px 0px rgba(0,0,0,0.5)', borderColor: isMinimalist ? '#FFF' : '#000' }}>
             <div className="border-4 border-white p-8 flex flex-col gap-8 items-center justify-center min-h-[500px]"
                  style={{ backgroundColor: isMinimalist ? '#000' : (isNeutral ? '#A0B0C0' : '#5c94fc'), borderColor: isMinimalist ? '#FFF' : '#FFF' }}>
                 <h3 
                    className="text-center text-4xl mb-4 text-white" 
                    style={{ 
                        fontFamily: THEME.font,
                        textShadow: (isMinimalist || isNeutral) ? 'none' : '4px 4px 0 #000'
                    }}
                >
                    TAKE A BREAK?
                </h3>

                <div className="flex gap-8 w-full justify-center">
                    <RetroButton onClick={() => startBreak(5)} colorType="green" size="lg" className="flex-1 text-2xl py-6 h-24" title="5 Min Break" themeMode={themeMode}                neutralPalette={neutralPalette}>                        5 MIN                    </RetroButton>                    <RetroButton onClick={() => startBreak(10)} colorType="green" size="lg" className="flex-1 text-2xl py-6 h-24" title="10 Min Break" themeMode={themeMode}                neutralPalette={neutralPalette}>                        10 MIN                    </RetroButton>                </div>

                <div className="w-full mt-6">
                     <RetroButton onClick={skipBreak} colorType="gray" size="lg" className="w-full py-4 text-xl h-16" title="Skip Break" themeMode={themeMode}
                neutralPalette={neutralPalette}
            >
                        SKIP & RESTART
                    </RetroButton>
                </div>
             </div>
        </div>
      )}


      {/* --- TIMER UI PRINCIPAL --- */}
      {isMinimized ? (
          <div className="flex flex-col items-center">
              <div 
                className={`p-6 border-4 rounded-lg shadow-lg flex flex-col items-center justify-center gap-2 backdrop-blur-md relative`}
                style={{ 
                    backgroundColor: isMinimalist 
                        ? 'rgba(0,0,0,0.8)' 
                        : (isNeutral 
                            ? (neutralPalette === 'dark' ? 'rgba(26,26,26,0.9)' : 'rgba(240,240,240,0.9)')
                            : 'rgba(16,16,16,0.85)'),
                    borderColor: isMinimalist 
                        ? '#FFF' 
                        : (isNeutral 
                            ? (neutralPalette === 'dark' ? '#404040' : '#808080')
                            : '#000'),
                    boxShadow: isMinimalist 
                        ? '8px 8px 0px rgba(255,255,255,0.4)' 
                        : (isNeutral 
                            ? (neutralPalette === 'dark' ? '8px 8px 0px rgba(0,0,0,0.5)' : '8px 8px 0px rgba(0,0,0,0.1)')
                            : '8px 8px 0px rgba(0,0,0,0.6)'),
                    imageRendering: (!isMinimalist && !isNeutral) ? 'pixelated' as const : undefined,
                    outline: (!isMinimalist && !isNeutral) ? '4px solid #404040' : 'none'
                }}
              >

                  {/* Maximize Button - Integrated Minimalist Style */}
                  <button 
                    onMouseDown={(e) => e.stopPropagation()} 
                    onClick={toggleMinimize}
                    className={`
                        absolute top-2 right-2 p-1 opacity-50 hover:opacity-100 transition-opacity font-bold text-lg
                        ${isMinimalist || isNeutral ? 'text-white' : 'text-white'}
                    `}
                    style={{ 
                        color: isMinimalist 
                            ? '#FFF' 
                            : (isNeutral 
                                ? (neutralPalette === 'dark' ? '#E0E0E0' : '#404040')
                                : '#FFF'), 
                        cursor: 'pointer' 
                    }}
                    title="Maximize Timer"
                  >
                    ⤢
                  </button>

                  <div 
                    className="text-4xl font-bold tracking-widest mt-2 select-none" 
                    style={{ 
                        fontFamily: THEME.font, 
                        color: isMinimalist 
                            ? '#FFF' 
                            : (isNeutral 
                                ? (neutralPalette === 'dark' 
                                    ? (timeLeft === 0 ? '#C07070' : '#E0E0E0')
                                    : (timeLeft === 0 ? '#B08080' : '#404040'))
                                : (timeLeft === 0 ? '#FF3030' : isBreakMode ? '#40FF40' : (isPaused ? '#FFFF00' : '#FFF'))),
                        textShadow: (!isMinimalist && !isNeutral) 
                            ? '3px 3px 0px rgba(0,0,0,0.7)' 
                            : 'none',
                        WebkitTextStroke: (!isMinimalist && !isNeutral) ? '2px rgba(0,0,0,0.8)' : '0px'
                    }}
                  >
                      {formatTime(timeLeft)}
                  </div>
                  <div className="flex gap-2">
                      <button 
                        onMouseDown={(e) => e.stopPropagation()} 
                        onClick={handleMainButtonClick} 
                        className={`px-3 py-1 text-[11px] font-bold border-2 rounded hover:opacity-80 transition-all`} 
                        style={{ 
                            borderColor: isMinimalist 
                                ? '#FFF' 
                                : (isNeutral 
                                    ? (neutralPalette === 'dark' ? '#E0E0E0' : '#404040')
                                    : '#FFF'), 
                            color: isMinimalist 
                                ? '#FFF' 
                                : (isNeutral 
                                    ? (neutralPalette === 'dark' ? '#E0E0E0' : '#404040')
                                    : '#FFF'),
                            backgroundColor: isMinimalist 
                                ? 'transparent' 
                                : (isNeutral 
                                    ? 'transparent' 
                                    : 'rgba(0,0,0,0.3)'),
                            cursor: 'pointer',
                            boxShadow: (!isMinimalist && !isNeutral) ? '2px 2px 0px rgba(0,0,0,0.6)' : 'none'
                        }}>
                          {isActive ? 'PAUSE' : (isPaused ? 'RESUME' : 'START')}
                      </button>
                      <span 
                        className="text-[10px] font-bold pt-1 select-none" 
                        style={{ 
                            color: isMinimalist 
                                ? '#CCC' 
                                : (isNeutral 
                                    ? (neutralPalette === 'dark' ? '#A0A0A0' : '#666')
                                    : '#AAA')
                        }}>
                          {isActive ? 'RUNNING' : (isPaused ? 'PAUSED' : '')}
                      </span>
                  </div>
              </div>
          </div>
      ) : (
        <div className="flex flex-col items-center w-full mb-10 animate-in fade-in duration-300 relative">
            
            {/* Minimize Button - Minimalist Integration */}
            <div className="w-full flex justify-end mb-2 max-w-md">
                 <button 
                    onClick={toggleMinimize}
                    className={`
                        w-8 h-8 flex items-center justify-center font-bold text-lg transition-opacity hover:opacity-70 active:scale-95
                        ${isMinimalist 
                            ? 'text-white' 
                            : (isNeutral 
                                ? 'text-gray-600' 
                                : 'text-black')
                        }
                    `}
                    title="Minimize Timer"
                 >
                    _
                 </button>
            </div>
            


            {/* Timer Text - Cores Vibrantes/Neon */}
            <div className="mb-6 relative group flex items-center justify-center gap-6">
                
                <div 
                className={`text-center leading-none select-none drop-shadow-lg transition-colors duration-300
                    ${timeLeft === 0 ? 'animate-pulse text-red-500' : ''}
                    ${isPaused ? 'animate-pulse' : ''}
                `}
                style={{ 
                    fontFamily: THEME.font, 
                    fontSize: '4.5rem',
                    WebkitTextStroke: (isMinimalist || isNeutral) ? '0px' : '3px #000',
                    textShadow: (isMinimalist || isNeutral) ? 'none' : '6px 6px 0px rgba(0,0,0,0.7)',
                    color: isMinimalist 
                        ? '#FFFFFF' 
                        : (isNeutral 
                            ? (neutralPalette === 'dark'
                                ? (timeLeft === 0 ? '#C07070' : isBreakMode ? '#80B080' : (isPaused ? '#B0B0B0' : '#E0E0E0'))
                                : (timeLeft === 0 ? '#B08080' : isBreakMode ? '#90B090' : (isPaused ? '#C0C0C0' : '#404040')))
                            : (timeLeft === 0 ? '#FF3030' : isBreakMode ? '#40FF40' : (isPaused ? '#FFFF00' : '#FFF')))
                }}
                >
                {formatTime(timeLeft)}
                </div>
            </div>

            {/* Energy Bar */}
            <div 
                className="relative w-full max-w-md h-12 box-border transition-transform hover:scale-105"
                style={{
                    backgroundColor: isNeutral 
                        ? (neutralPalette === 'dark' ? '#2A2A2A' : '#D0D0D0')
                        : '#101010',
                    border: '4px solid #000',
                    boxShadow: isMinimalist 
                        ? '8px 8px 0px #FFF' 
                        : (isNeutral 
                            ? (neutralPalette === 'dark' ? '8px 8px 0px rgba(0,0,0,0.5)' : '8px 8px 0px rgba(0,0,0,0.1)')
                            : '8px 8px 0px rgba(0,0,0,0.6)'),
                    outline: '4px solid #404040',
                    borderColor: isMinimalist ? '#FFF' : '#000'
                }}
            >
                {!isMinimalist && !isNeutral && (
                    <div className="absolute inset-0 opacity-20" 
                        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, #202020 10px, #202020 20px)' }} 
                    />
                )}

                <div 
                    style={{
                        width: `${progressPercentage}%`,
                        height: '100%',
                        backgroundColor: barColor,
                        backgroundImage: (isMinimalist || isNeutral) ? 'none' : `
                            linear-gradient(
                            45deg, 
                            rgba(255, 255, 255, 0.4) 25%, 
                            transparent 25%, 
                            transparent 50%, 
                            rgba(255, 255, 255, 0.4) 50%, 
                            rgba(255, 255, 255, 0.4) 75%, 
                            transparent 75%, 
                            transparent
                            )
                        `,
                        backgroundSize: '30px 30px',
                        transition: 'width 1s linear, background-color 0.5s ease',
                        borderRight: isMinimalist ? 'none' : '4px solid #000',
                        position: 'relative',
                        overflow: 'hidden',
                        filter: isPaused ? 'grayscale(0.7)' : 'none'
                    }}
                >
                    {!isMinimalist && !isNeutral && <div className="absolute top-0 left-0 w-full h-1/3 bg-white opacity-60" />}
                </div>
            </div>

            {/* Status Text - Cores Vibrantes ou Branco */}
            <div 
                className={`mt-4 text-sm tracking-widest ${!isActive && !isPaused ? 'animate-pulse' : ''}`}
                style={{ 
                    fontFamily: THEME.font, 
                    color: isMinimalist 
                        ? '#FFF' 
                        : (isNeutral 
                            ? (neutralPalette === 'dark' 
                                ? (timeLeft === 0 ? '#C07070' : isBreakMode ? '#80B080' : (isPaused ? '#B0B0B0' : '#E0E0E0'))
                                : '#404040')
                            : (timeLeft === 0 ? '#FF3030' : isBreakMode ? '#40FF40' : (isPaused ? '#FFFF00' : '#fff'))),
                    textShadow: (isMinimalist || isNeutral) ? 'none' : '2px 2px 0px #000'
                }}
            >
                {
                    timeLeft === 0 ? '!!! TIME OVER !!!' : 
                    isPaused ? '&gt;&gt;&gt; PAUSED &lt;&lt;&lt;' :
                    isActive ? (isBreakMode ? 'RECHARGING...' : '&gt;&gt;&gt; STUDYING &gt;&gt;&gt;') : 
                    'PRESS START'
                }
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4 items-center w-full mt-6">
                
                {/* Botão Principal: START / PAUSE / RESUME */}
                <RetroButton 
                    onClick={handleMainButtonClick} 
                    colorType={isPaused ? 'green' : isActive ? 'orange' : 'green'} 
                    size="lg"
                    sound={isActive ? 'pipe' : 'open'}
                    themeMode={themeMode}
                
                neutralPalette={neutralPalette}
            >
                    {isPaused ? 'RESUME' : isActive ? 'PAUSE' : 'START'}
                </RetroButton>
                
                {/* Botão Secundário: FINISH (Aparece apenas se Pausado ou Ativo - para encerrar) */}
                {(isPaused || isActive) && (
                    <RetroButton 
                        onClick={handleStop} 
                        colorType="red" 
                        size="md"
                        sound="pipe"
                        className="mt-2 text-xs"
                        themeMode={themeMode}
                    
                neutralPalette={neutralPalette}
            >
                        FINISH SESSION
                    </RetroButton>
                )}

                {/* Controles de ajuste de tempo (só aparecem se NÃO estiver rodando NEM pausado) */}
                {!isActive && !isPaused && (
                    <div className="flex gap-6 items-center mt-2 animate-in fade-in duration-300">
                    <RetroButton onClick={() => adjustTime(-60)} colorType="orange" size="icon" title="-1 Min" themeMode={themeMode}                neutralPalette={neutralPalette}>                        -                    </RetroButton>
                    <RetroButton onClick={resetTimer} colorType="blue" size="sm" title="Reset" sound="pipe" themeMode={themeMode}
                neutralPalette={neutralPalette}
            >
                        RST
                    </RetroButton>                    <RetroButton onClick={() => adjustTime(60)} colorType="orange" size="icon" title="+1 Min" themeMode={themeMode}                neutralPalette={neutralPalette}>                        +
                    </RetroButton>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
}
