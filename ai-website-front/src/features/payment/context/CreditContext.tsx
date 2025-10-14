"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { BillingService } from '../services/BillingService';

interface CreditContextType {
    credits: number;
    updateCredits: (amount: number) => void;
    refreshCredits: () => Promise<void>;
}

const CreditContext = createContext<CreditContextType | null>(null);

export function CreditProvider({ children }: { children: React.ReactNode }) {
    const [credits, setCredits] = useState<number>(0);

    const updateCredits = useCallback((amount: number) => {
        setCredits(prev => prev + amount);
    }, []);

    const refreshCredits = useCallback(async () => {
        try {
            const response = await BillingService.getCurrentCredit();
            setCredits(response.currentCredit);
        } catch (error) {
            console.error('크레딧 정보 조회 실패:', error);
        }
    }, []);

    // 컴포넌트 마운트 시 크레딧 정보 조회
    React.useEffect(() => {
        refreshCredits();
    }, [refreshCredits]);

    return (
        <CreditContext.Provider value={{ credits, updateCredits, refreshCredits }}>
            {children}
        </CreditContext.Provider>
    );
}

export function useCredit() {
    const context = useContext(CreditContext);
    if (!context) {
        throw new Error('useCredit must be used within a CreditProvider');
    }
    return context;
} 