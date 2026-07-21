'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '../lib/auth';

export interface SubscriptionData {
  subscription: {
    id: string;
    companyId: string;
    planId: string;
    status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
    startDate: string;
    expiryDate: string;
    paymentId: string | null;
    plan: {
      id: string;
      name: string;
      rank: 'TRIAL' | 'BRONZE' | 'SILVER' | 'GOLD';
      description: string;
      price: number;
      billingCycle: 'MONTHLY' | 'YEARLY';
      branchLimit: number;
      staffLimit: number;
      customerLimit: number;
      productLimit: number;
      invoiceLimit: number;
      quotationLimit: number;
      whatsappMessageLimit: number;
      customQuotationThemes: boolean;
      customInvoiceThemes: boolean;
      whatsappIntegration: boolean;
    };
  } | null;
  usage: {
    quotations: { limit: number; used: number; remaining: number };
    invoices: { limit: number; used: number; remaining: number };
    customers: { limit: number; used: number; remaining: number };
    products: { limit: number; used: number; remaining: number };
    branches: { limit: number; used: number; remaining: number };
    staff: { limit: number; used: number; remaining: number };
    whatsappMessages: { limit: number; used: number; remaining: number };
  } | null;
}

interface SubscriptionContextType {
  data: SubscriptionData | null;
  isLoading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  isExpired: boolean;
  daysRemaining: number | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/subscriptions/current`);
      if (!response.ok) {
        throw new Error('Failed to load subscription data');
      }
      const data = await response.json();
      setData(data);
    } catch (err: any) {
      console.error('Failed to fetch subscription:', err);
      setError(err.message || 'Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const isExpired = data?.subscription?.status === 'EXPIRED';
  
  let daysRemaining = null;
  if (data?.subscription?.expiryDate) {
    const end = new Date(data.subscription.expiryDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    daysRemaining = Math.ceil(diff / (1000 * 3600 * 24));
  }

  return (
    <SubscriptionContext.Provider
      value={{
        data,
        isLoading,
        error,
        refreshSubscription: fetchSubscription,
        isExpired,
        daysRemaining
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
