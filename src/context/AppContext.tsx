'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserInfo, RecommendationResponse } from '@/types';

interface AppContextType {
  userId: string | null;
  setUserId: (id: string) => void;
  userInfo: UserInfo;
  setUserInfo: (info: UserInfo) => void;
  currentRecommendation: RecommendationResponse | null;
  setCurrentRecommendation: (rec: RecommendationResponse | null) => void;
  previousRecommendations: RecommendationResponse[];
  addPreviousRecommendation: (rec: RecommendationResponse) => void;
  clearPreviousRecommendations: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const [currentRecommendation, setCurrentRecommendation] = useState<RecommendationResponse | null>(null);
  const [previousRecommendations, setPreviousRecommendations] = useState<RecommendationResponse[]>([]);

  useEffect(() => {
    // Load saved user info from localStorage
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      setUserInfo(JSON.parse(savedUserInfo));
    }

    // Get or create user ID
    let storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      // Create new user via API
      fetch('/api/users', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          localStorage.setItem('userId', data.id);
          setUserId(data.id);
        });
    } else {
      setUserId(storedUserId);
    }
  }, []);

  const addPreviousRecommendation = (rec: RecommendationResponse) => {
    setPreviousRecommendations(prev => [...prev, rec]);
  };

  const clearPreviousRecommendations = () => {
    setPreviousRecommendations([]);
  };

  return (
    <AppContext.Provider
      value={{
        userId,
        setUserId,
        userInfo,
        setUserInfo,
        currentRecommendation,
        setCurrentRecommendation,
        previousRecommendations,
        addPreviousRecommendation,
        clearPreviousRecommendations,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}