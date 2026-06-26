'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, isLoggedIn } from '../lib/auth';

export type Branch = {
  id: string;
  name: string;
  isMainBranch: boolean;
};

type BranchContextType = {
  branches: Branch[];
  selectedBranchId: string | null;
  setSelectedBranchId: (id: string) => void;
  isLoadingBranches: boolean;
};

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);

  useEffect(() => {
    async function loadBranches() {
      if (!isLoggedIn()) {
        setIsLoadingBranches(false);
        return;
      }
      try {
        const res = await apiFetch('/branches');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.branches.length > 0) {
            setBranches(data.branches);
            
            // Default to main branch if exists, otherwise first branch
            const mainBranch = data.branches.find((b: Branch) => b.isMainBranch);
            
            // Check if there's a stored preference
            const storedBranchId = localStorage.getItem('selectedBranchId');
            if (storedBranchId && data.branches.some((b: Branch) => b.id === storedBranchId)) {
              setSelectedBranchId(storedBranchId);
            } else {
              setSelectedBranchId(mainBranch ? mainBranch.id : data.branches[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load branches', err);
      } finally {
        setIsLoadingBranches(false);
      }
    }
    
    loadBranches();
  }, []);

  const handleSetSelectedBranchId = (id: string) => {
    setSelectedBranchId(id);
    localStorage.setItem('selectedBranchId', id);
  };

  return (
    <BranchContext.Provider value={{ 
      branches, 
      selectedBranchId, 
      setSelectedBranchId: handleSetSelectedBranchId,
      isLoadingBranches 
    }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
}
