import React, { createContext, useContext, useState, useEffect } from 'react';

interface PillarFilterContextType {
  selectedPillars: string[]; // Array of pillar IDs or ['all']
  setSelectedPillars: (pillars: string[]) => void;
  isAllPillarsSelected: boolean;
  togglePillar: (pillarId: string) => void;
  selectAllPillars: () => void;
  clearPillarFilter: () => void;
}

const PillarFilterContext = createContext<PillarFilterContextType | undefined>(undefined);

export const PillarFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedPillars, setSelectedPillars] = useState<string[]>(['all']);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedPillars');
    if (saved) {
      try {
        setSelectedPillars(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved pillar filter:', e);
      }
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('selectedPillars', JSON.stringify(selectedPillars));
  }, [selectedPillars]);

  const isAllPillarsSelected = selectedPillars.includes('all') || selectedPillars.length === 0;

  const togglePillar = (pillarId: string) => {
    if (pillarId === 'all') {
      selectAllPillars();
      return;
    }

    // For radio button behavior - set to single selection
    setSelectedPillars([pillarId]);
  };

  const selectAllPillars = () => {
    setSelectedPillars(['all']);
  };

  const clearPillarFilter = () => {
    setSelectedPillars(['all']);
  };

  return (
    <PillarFilterContext.Provider
      value={{
        selectedPillars,
        setSelectedPillars,
        isAllPillarsSelected,
        togglePillar,
        selectAllPillars,
        clearPillarFilter
      }}
    >
      {children}
    </PillarFilterContext.Provider>
  );
};

export const usePillarFilter = () => {
  const context = useContext(PillarFilterContext);
  if (context === undefined) {
    throw new Error('usePillarFilter must be used within a PillarFilterProvider');
  }
  return context;
};