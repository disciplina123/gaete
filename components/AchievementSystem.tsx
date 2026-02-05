// Sistema de Conquistas e Unlocks

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'time' | 'streak' | 'questions' | 'organization';
  unlocked: boolean;
  unlockedAt?: string;
  requirement: {
    type: 'total_minutes' | 'streak_days' | 'questions_correct' | 'questions_accuracy' | 'subjects_created' | 'books_created' | 'quests_created' | 'total_questions';
    target: number;
    current?: number;
  };
}

export interface UnlockTier {
  achievementsRequired: number;
  name: string;
  description: string;
  unlocks: string[];
}

// Sistema de Tiers - Desbloqueios baseados em quantidade de conquistas
export const UNLOCK_TIERS: UnlockTier[] = [
  {
    achievementsRequired: 0,
    name: 'Iniciante',
    description: 'Funcionalidades básicas',
    unlocks: ['mario-dynamic', 'theme-mario']
  },
  {
    achievementsRequired: 5,
    name: 'Aprendiz',
    description: 'Primeiras customizações',
    unlocks: ['theme-neutral', 'palette-classic', 'auto-time-mode']
  },
  {
    achievementsRequired: 10,
    name: 'Dedicado',
    description: 'Mais controle sobre o timer',
    unlocks: ['timer-position', 'daily-goal-custom', 'alpine-peaks', 'sunset-city']
  },
  {
    achievementsRequired: 18,
    name: 'Estudioso',
    description: 'Novas paletas e backgrounds',
    unlocks: ['palette-warm', 'palette-cool', 'mystic-forest', 'ocean-view']
  },
  {
    achievementsRequired: 26,
    name: 'Especialista',
    description: 'Recursos avançados',
    unlocks: ['theme-minimalist', 'cloud-kingdom', 'rainy-street', 'music-player']
  },
  {
    achievementsRequired: 32,
    name: 'Mestre',
    description: 'Tudo desbloqueado!',
    unlocks: ['palette-dark', 'train-journey', 'agenda-full']
  }
];

// Define todas as conquistas do jogo (36 conquistas - 9 por categoria)
export const ALL_ACHIEVEMENTS: Achievement[] = [
  // ===== TEMPO DE ESTUDO (9 conquistas) =====
  {
    id: 'time_30min',
    name: 'PRIMEIRO PASSO',
    description: '30 MIN',
    icon: '▫',
    category: 'time',
    unlocked: false,
    requirement: { type: 'total_minutes', target: 30 }
  },
  {
    id: 'time_1h',
    name: 'INICIANTE',
    description: '1 HORA',
    icon: '▪',
    category: 'time',
    unlocked: false,
    requirement: { type: 'total_minutes', target: 60 }
  },
  {
    id: 'time_3h',
    name: 'COMPROMETIDO',
    description: '3 HORAS',
    icon: '◾',
    category: 'time',
    unlocked: false,
    requirement: { type: 'total_minutes', target: 180 }
  },
  {
    id: 'time_10h',
    name: 'PERSISTENTE',
    description: '10 HORAS',
    icon: '◼',
    category: 'time',
    unlocked: false,
    requirement: { type: 'total_minutes', target: 600 }
  },
  {
    id: 'time_25h',
    name: 'DEDICADO',
    description: '25 HORAS',
    icon: '■',
    category: 'time',
    unlocked: false,
    requirement: { type: 'total_minutes', target: 1500 }
  },
  {
    id: 'time_50h',
    name: 'ESTUDIOSO',
    description: '50 HORAS',
    icon: '▣',
    category: 'time',
    unlocked: false,
    requirement: { type: 'total_minutes', target: 3000 }
  },
  {
    id: 'time_100h',
    name: 'CENTURIAO',
    description: '100 HORAS',
    icon: '▦',
    category: 'time',
    unlocked: false,
    requirement: { type: 'total_minutes', target: 6000 }
  },
  {
    id: 'time_200h',
    name: 'MARATONISTA',
    description: '200 HORAS',
    icon: '▧',
    category: 'time',
    unlocked: false,
    requirement: { type: 'total_minutes', target: 12000 }
  },
  {
    id: 'time_500h',
    name: 'LENDA',
    description: '500 HORAS',
    icon: '▩',
    category: 'time',
    unlocked: false,
    requirement: { type: 'total_minutes', target: 30000 }
  },

  // ===== CONSISTÊNCIA (9 conquistas) =====
  {
    id: 'streak_2d',
    name: 'COMECANDO',
    description: '2 DIAS',
    icon: '▸',
    category: 'streak',
    unlocked: false,
    requirement: { type: 'streak_days', target: 2 }
  },
  {
    id: 'streak_3d',
    name: 'AQUECENDO',
    description: '3 DIAS',
    icon: '▹',
    category: 'streak',
    unlocked: false,
    requirement: { type: 'streak_days', target: 3 }
  },
  {
    id: 'streak_5d',
    name: 'SEMANA UTIL',
    description: '5 DIAS',
    icon: '▶',
    category: 'streak',
    unlocked: false,
    requirement: { type: 'streak_days', target: 5 }
  },
  {
    id: 'streak_7d',
    name: 'SEMANA FORTE',
    description: '7 DIAS',
    icon: '►',
    category: 'streak',
    unlocked: false,
    requirement: { type: 'streak_days', target: 7 }
  },
  {
    id: 'streak_14d',
    name: 'DUAS SEMANAS',
    description: '14 DIAS',
    icon: '▻',
    category: 'streak',
    unlocked: false,
    requirement: { type: 'streak_days', target: 14 }
  },
  {
    id: 'streak_21d',
    name: 'HABITO',
    description: '21 DIAS',
    icon: '▮',
    category: 'streak',
    unlocked: false,
    requirement: { type: 'streak_days', target: 21 }
  },
  {
    id: 'streak_30d',
    name: 'MES INTEIRO',
    description: '30 DIAS',
    icon: '▰',
    category: 'streak',
    unlocked: false,
    requirement: { type: 'streak_days', target: 30 }
  },
  {
    id: 'streak_60d',
    name: 'IMPARAVEL',
    description: '60 DIAS',
    icon: '▱',
    category: 'streak',
    unlocked: false,
    requirement: { type: 'streak_days', target: 60 }
  },
  {
    id: 'streak_100d',
    name: 'INABALAVEL',
    description: '100 DIAS',
    icon: '▬',
    category: 'streak',
    unlocked: false,
    requirement: { type: 'streak_days', target: 100 }
  },

  // ===== QUESTÕES (9 conquistas) =====
  {
    id: 'questions_5',
    name: 'CURIOSO',
    description: '5 QUESTOES',
    icon: '▫',
    category: 'questions',
    unlocked: false,
    requirement: { type: 'total_questions', target: 5 }
  },
  {
    id: 'questions_25',
    name: 'PRATICANDO',
    description: '25 QUESTOES',
    icon: '▪',
    category: 'questions',
    unlocked: false,
    requirement: { type: 'total_questions', target: 25 }
  },
  {
    id: 'questions_50_correct',
    name: 'ACERTADOR',
    description: '50 CORRETAS',
    icon: '◽',
    category: 'questions',
    unlocked: false,
    requirement: { type: 'questions_correct', target: 50 }
  },
  {
    id: 'questions_100',
    name: 'CENTENAR',
    description: '100 QUESTOES',
    icon: '◾',
    category: 'questions',
    unlocked: false,
    requirement: { type: 'total_questions', target: 100 }
  },
  {
    id: 'questions_150_correct',
    name: 'EXPERT',
    description: '150 CORRETAS',
    icon: '◼',
    category: 'questions',
    unlocked: false,
    requirement: { type: 'questions_correct', target: 150 }
  },
  {
    id: 'questions_75_accuracy',
    name: 'PRECISO',
    description: '75% (50+)',
    icon: '▣',
    category: 'questions',
    unlocked: false,
    requirement: { type: 'questions_accuracy', target: 75 }
  },
  {
    id: 'questions_300_correct',
    name: 'TREZENTOS',
    description: '300 CORRETAS',
    icon: '▦',
    category: 'questions',
    unlocked: false,
    requirement: { type: 'questions_correct', target: 300 }
  },
  {
    id: 'questions_85_accuracy',
    name: 'MESTRE',
    description: '85% (100+)',
    icon: '▧',
    category: 'questions',
    unlocked: false,
    requirement: { type: 'questions_accuracy', target: 85 }
  },
  {
    id: 'questions_500_correct',
    name: 'GENIO',
    description: '500 CORRETAS',
    icon: '▩',
    category: 'questions',
    unlocked: false,
    requirement: { type: 'questions_correct', target: 500 }
  },

  // ===== ORGANIZAÇÃO (9 conquistas) =====
  {
    id: 'org_1_subject',
    name: 'PRIMEIRA',
    description: '1 MATERIA',
    icon: '◂',
    category: 'organization',
    unlocked: false,
    requirement: { type: 'subjects_created', target: 1 }
  },
  {
    id: 'org_3_subjects',
    name: 'ORGANIZADO',
    description: '3 MATERIAS',
    icon: '◃',
    category: 'organization',
    unlocked: false,
    requirement: { type: 'subjects_created', target: 3 }
  },
  {
    id: 'org_5_books',
    name: 'BIBLIOTECARIO',
    description: '5 LIVROS',
    icon: '◄',
    category: 'organization',
    unlocked: false,
    requirement: { type: 'books_created', target: 5 }
  },
  {
    id: 'org_5_subjects',
    name: 'MULTITAREFA',
    description: '5 MATERIAS',
    icon: '◅',
    category: 'organization',
    unlocked: false,
    requirement: { type: 'subjects_created', target: 5 }
  },
  {
    id: 'org_10_quests',
    name: 'PLANEJADOR',
    description: '10 QUESTS',
    icon: '▀',
    category: 'organization',
    unlocked: false,
    requirement: { type: 'quests_created', target: 10 }
  },
  {
    id: 'org_15_books',
    name: 'COLECIONADOR',
    description: '15 LIVROS',
    icon: '▄',
    category: 'organization',
    unlocked: false,
    requirement: { type: 'books_created', target: 15 }
  },
  {
    id: 'org_8_subjects',
    name: 'POLIMATA',
    description: '8 MATERIAS',
    icon: '█',
    category: 'organization',
    unlocked: false,
    requirement: { type: 'subjects_created', target: 8 }
  },
  {
    id: 'org_50_quests',
    name: 'SUPER PLANEJADOR',
    description: '50 QUESTS',
    icon: '▌',
    category: 'organization',
    unlocked: false,
    requirement: { type: 'quests_created', target: 50 }
  },
  {
    id: 'org_100_quests',
    name: 'MESTRE PLANEJADOR',
    description: '100 QUESTS',
    icon: '▐',
    category: 'organization',
    unlocked: false,
    requirement: { type: 'quests_created', target: 100 }
  }
];

// Função para carregar achievements do localStorage
export const loadAchievements = (): Achievement[] => {
  const saved = localStorage.getItem('achievements');
  if (saved) {
    const savedAchievements = JSON.parse(saved);
    return ALL_ACHIEVEMENTS.map(achievement => {
      const savedAch = savedAchievements.find((a: Achievement) => a.id === achievement.id);
      return savedAch ? { ...achievement, ...savedAch } : achievement;
    });
  }
  return [...ALL_ACHIEVEMENTS];
};

// Função para salvar achievements no localStorage
export const saveAchievements = (achievements: Achievement[]) => {
  localStorage.setItem('achievements', JSON.stringify(achievements));
};

// Calcular streak atual
export const calculateCurrentStreak = (studyLog: Record<string, number>): number => {
  const dates = Object.keys(studyLog).sort().reverse();
  if (dates.length === 0) return 0;

  let streak = 0;
  const today = new Date().toLocaleDateString('en-CA');
  let currentDate = new Date(today);

  for (let i = 0; i < dates.length; i++) {
    const checkDate = currentDate.toLocaleDateString('en-CA');
    
    if (studyLog[checkDate] && studyLog[checkDate] > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

// Calcular total de minutos
export const calculateTotalMinutes = (studyLog: Record<string, number>): number => {
  return Object.values(studyLog).reduce((sum, minutes) => sum + minutes, 0);
};

// Calcular estatísticas de questões
export const calculateQuestionStats = (questionLog: Record<string, { total: number, correct: number }>) => {
  let totalQuestions = 0;
  let totalCorrect = 0;

  Object.values(questionLog).forEach(day => {
    totalQuestions += day.total;
    totalCorrect += day.correct;
  });

  const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

  return { totalQuestions, totalCorrect, accuracy };
};

// Verificar e desbloquear conquistas
export const checkAndUnlockAchievements = (
  achievements: Achievement[],
  studyLog: Record<string, number>,
  questionLog: Record<string, { total: number, correct: number }>,
  subjects: any[]
): { updatedAchievements: Achievement[], newlyUnlocked: Achievement[] } => {
  const totalMinutes = calculateTotalMinutes(studyLog);
  const currentStreak = calculateCurrentStreak(studyLog);
  const { totalQuestions, totalCorrect, accuracy } = calculateQuestionStats(questionLog);
  
  const totalBooks = subjects.reduce((sum, s) => sum + s.books.length, 0);
  const totalQuests = subjects.reduce((sum, s) => 
    sum + s.books.reduce((bookSum: number, b: any) => 
      bookSum + b.chapters.reduce((chapSum: number, c: any) => chapSum + c.quests.length, 0)
    , 0)
  , 0);

  const newlyUnlocked: Achievement[] = [];
  
  const updatedAchievements = achievements.map(achievement => {
    if (achievement.unlocked) return achievement;

    let currentValue = 0;
    let shouldUnlock = false;

    switch (achievement.requirement.type) {
      case 'total_minutes':
        currentValue = totalMinutes;
        shouldUnlock = currentValue >= achievement.requirement.target;
        break;
      case 'streak_days':
        currentValue = currentStreak;
        shouldUnlock = currentValue >= achievement.requirement.target;
        break;
      case 'total_questions':
        currentValue = totalQuestions;
        shouldUnlock = currentValue >= achievement.requirement.target;
        break;
      case 'questions_correct':
        currentValue = totalCorrect;
        shouldUnlock = currentValue >= achievement.requirement.target;
        break;
      case 'questions_accuracy':
        currentValue = accuracy;
        let minQuestions = 30;
        if (achievement.requirement.target >= 85) minQuestions = 100;
        else if (achievement.requirement.target >= 75) minQuestions = 50;
        shouldUnlock = totalQuestions >= minQuestions && accuracy >= achievement.requirement.target;
        break;
      case 'subjects_created':
        currentValue = subjects.length;
        shouldUnlock = currentValue >= achievement.requirement.target;
        break;
      case 'books_created':
        currentValue = totalBooks;
        shouldUnlock = currentValue >= achievement.requirement.target;
        break;
      case 'quests_created':
        currentValue = totalQuests;
        shouldUnlock = currentValue >= achievement.requirement.target;
        break;
    }

    const updated = {
      ...achievement,
      requirement: { ...achievement.requirement, current: currentValue }
    };

    if (shouldUnlock) {
      updated.unlocked = true;
      updated.unlockedAt = new Date().toISOString();
      newlyUnlocked.push(updated);
    }

    return updated;
  });

  return { updatedAchievements, newlyUnlocked };
};

// Obter tier atual baseado no número de conquistas
export const getCurrentTier = (achievements: Achievement[]): UnlockTier => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  
  // Retorna o tier mais alto que o usuário atingiu
  for (let i = UNLOCK_TIERS.length - 1; i >= 0; i--) {
    if (unlockedCount >= UNLOCK_TIERS[i].achievementsRequired) {
      return UNLOCK_TIERS[i];
    }
  }
  
  return UNLOCK_TIERS[0];
};

// Verificar se um recurso está desbloqueado
export const isFeatureUnlocked = (
  featureId: string,
  achievements: Achievement[]
): boolean => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  
  // Percorre todos os tiers e verifica se algum deles desbloqueia o recurso
  for (const tier of UNLOCK_TIERS) {
    if (unlockedCount >= tier.achievementsRequired && tier.unlocks.includes(featureId)) {
      return true;
    }
  }
  
  return false;
};

// Obter próximo tier
export const getNextTier = (achievements: Achievement[]): UnlockTier | null => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  
  for (const tier of UNLOCK_TIERS) {
    if (unlockedCount < tier.achievementsRequired) {
      return tier;
    }
  }
  
  return null;
};

// Obter todas as features desbloqueadas
export const getUnlockedFeatures = (achievements: Achievement[]): string[] => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const features: string[] = [];
  
  for (const tier of UNLOCK_TIERS) {
    if (unlockedCount >= tier.achievementsRequired) {
      features.push(...tier.unlocks);
    }
  }
  
  return features;
};
