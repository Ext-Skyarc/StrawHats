import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  WasteItemLog,
  EnergyLog,
  Mission,
  Badge,
  UserSettings,
  WasteCategory,
} from '../types';
import {
  DEFAULT_SETTINGS,
  INITIAL_WASTE_LOGS,
  INITIAL_ENERGY_LOGS,
  INITIAL_MISSIONS,
  BADGES_LIST,
} from '../data/initialData';

export type AppTab =
  | 'dashboard'
  | 'calculator'
  | 'waste'
  | 'energy'
  | 'coach'
  | 'impact'
  | 'missions'
  | 'ledger'
  | 'kiro'
  | 'community'
  | 'leaderboard';

export interface EcoReport {
  id: number;
  photo: string;
  description: string;
  location: string;
  type: string;
  flower: string;
  date: string;
  author: string;
  likes?: number;
  liked?: boolean;
}

export interface EcoBioAction {
  id: number;
  action: string;
  actionLabel: string;
  note: string;
  photo: string;
  date: string;
  points: number;
  author: string;
}

interface GreenPulseContextType {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  wasteLogs: WasteItemLog[];
  energyLogs: EnergyLog[];
  missions: Mission[];
  badges: Badge[];
  userSettings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  streakDays: number;
  totalXp: number;
  userLevel: number;
  levelXpProgress: { current: number; max: number };
  sustainabilityScore: number;
  
  // Computed summaries
  totalMonthlyKwh: number;
  totalMonthlyCost: number;
  totalMonthlyCo2eKg: number;
  totalWasteItems: number;
  divertedWasteItems: number;
  wasteDiversionRate: number;
  totalWasteAvoidedCo2eKg: number;

  // Actions
  addWasteLog: (item: Omit<WasteItemLog, 'id' | 'timestamp'>) => void;
  removeWasteLog: (id: string) => void;
  confirmWasteCategory: (id: string, category: WasteCategory) => void;
  addEnergyLog: (item: Omit<EnergyLog, 'id' | 'timestamp'>) => void;
  removeEnergyLog: (id: string) => void;
  toggleMission: (id: string) => void;
  addMissionFromCoach: (mission: { title: string; description: string; points: number }) => void;
  resetToDemoData: () => void;

  // EcoQuest state
  ecoReports: EcoReport[];
  addEcoReport: (report: Omit<EcoReport, 'id' | 'date'>) => void;
  likeEcoReport: (id: number) => void;
  ecoFlowers: string[];
  ecoPoints: number;
  bioActions: EcoBioAction[];
  addBioAction: (action: Omit<EcoBioAction, 'id' | 'date' | 'points' | 'author'>) => void;
  pendingBioReport: { id: number; description: string; type: string; location: string } | null;
  setPendingBioReport: (rep: { id: number; description: string; type: string; location: string } | null) => void;
  rewardModalOpen: boolean;
  setRewardModalOpen: (open: boolean) => void;
  rewardClaimed: boolean;
  claimReward: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  
  // Hackathon Demo Story Guided Tour
  demoStep: number;
  setDemoStep: (step: number) => void;
  isDemoBarOpen: boolean;
  setIsDemoBarOpen: (open: boolean) => void;
  triggerConfetti: () => void;
}

const GreenPulseContext = createContext<GreenPulseContextType | undefined>(undefined);

const STORAGE_KEYS = {
  WASTE: 'greenpulse_waste_v1',
  ENERGY: 'greenpulse_energy_v1',
  MISSIONS: 'greenpulse_missions_v1',
  BADGES: 'greenpulse_badges_v1',
  SETTINGS: 'greenpulse_settings_v1',
  STREAK: 'greenpulse_streak_v1',
  XP: 'greenpulse_xp_v1',
};

export const GreenPulseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [demoStep, setDemoStep] = useState<number>(1);
  const [isDemoBarOpen, setIsDemoBarOpen] = useState<boolean>(true);

  // Initialize from localStorage or fallback to rich mock data
  const [wasteLogs, setWasteLogs] = useState<WasteItemLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WASTE);
      return stored ? JSON.parse(stored) : INITIAL_WASTE_LOGS;
    } catch {
      return INITIAL_WASTE_LOGS;
    }
  });

  const [energyLogs, setEnergyLogs] = useState<EnergyLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ENERGY);
      return stored ? JSON.parse(stored) : INITIAL_ENERGY_LOGS;
    } catch {
      return INITIAL_ENERGY_LOGS;
    }
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MISSIONS);
      return stored ? JSON.parse(stored) : INITIAL_MISSIONS;
    } catch {
      return INITIAL_MISSIONS;
    }
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BADGES);
      return stored ? JSON.parse(stored) : BADGES_LIST;
    } catch {
      return BADGES_LIST;
    }
  });

  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [streakDays, setStreakDays] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STREAK);
      return stored ? JSON.parse(stored) : 5;
    } catch {
      return 5;
    }
  });

  const [totalXp, setTotalXp] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.XP);
      return stored ? JSON.parse(stored) : 340;
    } catch {
      return 340;
    }
  });

  // EcoQuest state
  const [ecoReports, setEcoReports] = useState<EcoReport[]>(() => {
    try {
      const stored = localStorage.getItem('ecoquest_reports_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 1,
        photo: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
        description: 'Cleared plastic bottles and wrappers from neighborhood sidewalk.',
        location: 'Sunset Boulevard & 4th Ave',
        type: 'Plastic',
        flower: '🌸',
        date: new Date().toISOString().split('T')[0],
        author: 'GreenGuru',
        likes: 12,
      },
      {
        id: 2,
        photo: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=600&q=80',
        description: 'Sorted discarded cardboard boxes and flattened for community bin.',
        location: 'Westside Community Park',
        type: 'Paper',
        flower: '🌻',
        date: new Date().toISOString().split('T')[0],
        author: 'EcoQueen',
        likes: 8,
      },
      {
        id: 3,
        photo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
        description: 'Organized food scraps and veggie peelings into home composting tumbler.',
        location: 'Backyard Garden',
        type: 'Food waste',
        flower: '🌼',
        date: new Date().toISOString().split('T')[0],
        author: 'CleanCrusader',
        likes: 19,
      },
    ];
  });

  const [ecoFlowers, setEcoFlowers] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('ecoquest_flowers_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return ['🌼', '🌸', '🌻', '🌺', '🌷'];
  });

  const [ecoPoints, setEcoPoints] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('ecoquest_points_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return 130;
  });

  const [bioActions, setBioActions] = useState<EcoBioAction[]>(() => {
    try {
      const stored = localStorage.getItem('ecoquest_bioactions_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [pendingBioReport, setPendingBioReport] = useState<{ id: number; description: string; type: string; location: string } | null>(null);
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(() => {
    try {
      return localStorage.getItem('ecoquest_reward_claimed_v1') === 'true';
    } catch {
      return false;
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  const addEcoReport = (report: Omit<EcoReport, 'id' | 'date'>) => {
    const newRep: EcoReport = {
      ...report,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      likes: 0,
    };
    setEcoReports((prev) => [newRep, ...prev]);
    setEcoFlowers((prev) => [...prev, report.flower]);
    setEcoPoints((prev) => prev + 10);
    setStreakDays((prev) => prev + 1);
    setTotalXp((prev) => prev + 25);
    try {
      localStorage.setItem('ecoquest_reports_v1', JSON.stringify([newRep, ...ecoReports]));
      localStorage.setItem('ecoquest_flowers_v1', JSON.stringify([...ecoFlowers, report.flower]));
      localStorage.setItem('ecoquest_points_v1', JSON.stringify(ecoPoints + 10));
    } catch {}
  };

  const likeEcoReport = (id: number) => {
    setEcoReports((prev) =>
      prev.map((r) => {
        if (r.id === id && !r.liked) {
          return { ...r, likes: (r.likes || 0) + 1, liked: true };
        }
        return r;
      })
    );
    showToast('A little encouragement goes a long way! ♥');
  };

  const addBioAction = (action: Omit<EcoBioAction, 'id' | 'date' | 'points' | 'author'>) => {
    const newAct: EcoBioAction = {
      ...action,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      points: 25,
      author: userSettings.userName || 'Priyanshu',
    };
    setBioActions((prev) => [newAct, ...prev]);
    setEcoPoints((prev) => prev + 25);
    setTotalXp((prev) => prev + 50);
    showToast('Proof submitted! +25 bonus green points 🌿');
    try {
      localStorage.setItem('ecoquest_bioactions_v1', JSON.stringify([newAct, ...bioActions]));
      localStorage.setItem('ecoquest_points_v1', JSON.stringify(ecoPoints + 25));
    } catch {}
  };

  const claimReward = () => {
    setRewardClaimed(true);
    setRewardModalOpen(false);
    triggerConfetti();
    try {
      localStorage.setItem('ecoquest_reward_claimed_v1', 'true');
    } catch {}
    showToast('Green Hero reward claimed! 🌍');
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WASTE, JSON.stringify(wasteLogs));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [wasteLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ENERGY, JSON.stringify(energyLogs));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [energyLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [missions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [badges]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(userSettings));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [userSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.XP, JSON.stringify(totalXp));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [totalXp]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#059669', '#34d399', '#6ee7b7', '#f59e0b'],
      });
    } catch {
      // safe fallback if canvas is restricted
    }
  };

  // Level & XP math (Each level = 100 XP)
  const userLevel = Math.floor(totalXp / 100) + 1;
  const levelXpProgress = {
    current: totalXp % 100,
    max: 100,
  };

  // Energy aggregates
  const totalMonthlyKwh = useMemo(() => {
    return Number(energyLogs.reduce((acc, curr) => acc + curr.monthlyKwh, 0).toFixed(1));
  }, [energyLogs]);

  const totalMonthlyCost = useMemo(() => {
    return Number(energyLogs.reduce((acc, curr) => acc + curr.monthlyCost, 0).toFixed(2));
  }, [energyLogs]);

  const totalMonthlyCo2eKg = useMemo(() => {
    return Number(energyLogs.reduce((acc, curr) => acc + curr.monthlyCo2eKg, 0).toFixed(1));
  }, [energyLogs]);

  // Waste aggregates
  const totalWasteItems = wasteLogs.length;
  const divertedWasteItems = useMemo(() => {
    return wasteLogs.filter((w) => w.diversionEligible || w.category !== 'Landfill').length;
  }, [wasteLogs]);

  const wasteDiversionRate = useMemo(() => {
    if (totalWasteItems === 0) return 0;
    return Math.round((divertedWasteItems / totalWasteItems) * 100);
  }, [divertedWasteItems, totalWasteItems]);

  const totalWasteAvoidedCo2eKg = useMemo(() => {
    return Number(
      wasteLogs
        .filter((w) => w.diversionEligible || w.category !== 'Landfill')
        .reduce((acc, curr) => acc + (curr.avoidedCo2eKg || 0), 0)
        .toFixed(2)
    );
  }, [wasteLogs]);

  // Overall GreenPulse Sustainability Impact Score (0 - 100)
  // Transparent algorithm:
  // - Waste diversion component: up to 35 points (diversion rate * 0.35)
  // - Energy moderating component: up to 35 points (baseline ~750 kWh typical home, lower consumption = higher score)
  // - Missions & Habits component: up to 30 points (missions completed, streak bonus)
  const sustainabilityScore = useMemo(() => {
    const wasteScore = Math.min(35, (wasteDiversionRate / 100) * 35);

    // Energy score: benchmark 600 kWh/month. If less than 400 kWh, award max 35 pts.
    let energyScore = 35;
    if (totalMonthlyKwh > 300) {
      energyScore = Math.max(10, 35 - ((totalMonthlyKwh - 300) / 400) * 20);
    }

    const completedMissionsCount = missions.filter((m) => m.completed).length;
    const missionScore = Math.min(30, completedMissionsCount * 4 + Math.min(10, streakDays * 2));

    const total = Math.round(wasteScore + energyScore + missionScore);
    return Math.min(99, Math.max(25, total));
  }, [wasteDiversionRate, totalMonthlyKwh, missions, streakDays]);

  // Actions
  const addWasteLog = (item: Omit<WasteItemLog, 'id' | 'timestamp'>) => {
    const newLog: WasteItemLog = {
      ...item,
      id: 'w-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    setWasteLogs((prev) => [newLog, ...prev]);
    setTotalXp((xp) => xp + 25);
    triggerConfetti();

    // Check badges
    checkAndUnlockBadges('waste', wasteLogs.length + 1);
  };

  const removeWasteLog = (id: string) => {
    setWasteLogs((prev) => prev.filter((item) => item.id !== id));
  };

  const confirmWasteCategory = (id: string, category: WasteCategory) => {
    setWasteLogs((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const isDiverted = category !== 'Landfill';
          return {
            ...item,
            category,
            confirmedByUser: true,
            diversionEligible: isDiverted,
          };
        }
        return item;
      })
    );
  };

  const addEnergyLog = (item: Omit<EnergyLog, 'id' | 'timestamp'>) => {
    const newLog: EnergyLog = {
      ...item,
      id: 'e-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    setEnergyLogs((prev) => [newLog, ...prev]);
    setTotalXp((xp) => xp + 20);
    triggerConfetti();

    checkAndUnlockBadges('energy', energyLogs.length + 1);
  };

  const removeEnergyLog = (id: string) => {
    setEnergyLogs((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleMission = (id: string) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextCompleted = !m.completed;
          if (nextCompleted) {
            setTotalXp((xp) => xp + m.points);
            triggerConfetti();
          }
          return {
            ...m,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return m;
      })
    );
  };

  const addMissionFromCoach = (missionData: { title: string; description: string; points: number }) => {
    const newMission: Mission = {
      id: 'm-' + Date.now(),
      title: missionData.title,
      description: missionData.description,
      category: 'habit',
      period: 'daily',
      points: missionData.points || 30,
      difficulty: 'Easy',
      completed: false,
    };
    setMissions((prev) => [newMission, ...prev]);
    setActiveTab('missions');
    triggerConfetti();
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setUserSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const checkAndUnlockBadges = (type: 'waste' | 'energy', count: number) => {
    setBadges((prev) =>
      prev.map((b) => {
        if (b.id === 'b-2' && type === 'energy' && count >= 3 && !b.unlocked) {
          return { ...b, unlocked: true, unlockedAt: new Date().toISOString() };
        }
        if (b.id === 'b-3' && type === 'waste' && count >= 5 && !b.unlocked) {
          return { ...b, unlocked: true, unlockedAt: new Date().toISOString() };
        }
        return b;
      })
    );
  };

  const resetToDemoData = () => {
    setWasteLogs(INITIAL_WASTE_LOGS);
    setEnergyLogs(INITIAL_ENERGY_LOGS);
    setMissions(INITIAL_MISSIONS);
    setBadges(BADGES_LIST);
    setUserSettings(DEFAULT_SETTINGS);
    setStreakDays(5);
    setTotalXp(340);
    setDemoStep(1);
    setActiveTab('dashboard');
  };

  return (
    <GreenPulseContext.Provider
      value={{
        activeTab,
        setActiveTab,
        wasteLogs,
        energyLogs,
        missions,
        badges,
        userSettings,
        updateSettings,
        streakDays,
        totalXp,
        userLevel,
        levelXpProgress,
        sustainabilityScore,
        totalMonthlyKwh,
        totalMonthlyCost,
        totalMonthlyCo2eKg,
        totalWasteItems,
        divertedWasteItems,
        wasteDiversionRate,
        totalWasteAvoidedCo2eKg,
        addWasteLog,
        removeWasteLog,
        confirmWasteCategory,
        addEnergyLog,
        removeEnergyLog,
        toggleMission,
        addMissionFromCoach,
        resetToDemoData,
        demoStep,
        setDemoStep,
        isDemoBarOpen,
        setIsDemoBarOpen,
        triggerConfetti,
        ecoReports,
        addEcoReport,
        likeEcoReport,
        ecoFlowers,
        ecoPoints,
        bioActions,
        addBioAction,
        pendingBioReport,
        setPendingBioReport,
        rewardModalOpen,
        setRewardModalOpen,
        rewardClaimed,
        claimReward,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </GreenPulseContext.Provider>
  );
};

export const useGreenPulse = () => {
  const context = useContext(GreenPulseContext);
  if (!context) {
    throw new Error('useGreenPulse must be used within a GreenPulseProvider');
  }
  return context;
};
