'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { PageRoute } from '@/app/types';

interface NavigationContextType {
  currentPage: PageRoute;
  navigateTo: (page: PageRoute) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [currentPage, setCurrentPage] = useState<PageRoute>(PageRoute.LANDING);

  const navigateTo = useCallback((page: PageRoute) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <NavigationContext.Provider value={{ currentPage, navigateTo }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error('useNavigation deve ser utilizado dentro de um NavigationProvider');
  }

  return context;
}
