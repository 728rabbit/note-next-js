// app/contexts/admin_navigator.tsx
'use client'

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';

// Admin user type
type AdminNavigator = Array<{ name: string; url: string; }> | null;

interface NavigatorContextType {
    pageIndex: string,
    pageSubIndex: string,
    adminNavigator: AdminNavigator,
    setAdminNavigator: React.Dispatch<React.SetStateAction<AdminNavigator>>,
    setPageIndex: (s: string) => void, // This function accepts one argument named 's', which is of type string.
    setPageSubIndex: (s: string) => void // This function accepts one argument named 's', which is of type string.
}

// Create Context
const NavigatorContext = createContext<NavigatorContextType | undefined>(undefined);

// Provider Component
export function AdminNavigatorProvider({ children }: { children: ReactNode }) {
    const [pageIndex, setPageIndex] = useState<string>('');
    const [pageSubIndex, setPageSubIndex] = useState<string>('');
    const [adminNavigator, setAdminNavigator] = useState<AdminNavigator>(null);

    return (
        <NavigatorContext.Provider value={{ pageIndex, pageSubIndex, adminNavigator, setAdminNavigator, setPageIndex, setPageSubIndex }}>
            {children}
        </NavigatorContext.Provider>
    );
}

// Custom hook
export const useAdminNavigator = () => {
    const ctx = useContext(NavigatorContext);
    if (!ctx) {
        throw new Error('useAdminNavigator must be used within AdminNavigatorProvider');
    }
    return ctx;
}

export function useAdminPageIndex(pageIndex: string) {
    const { setPageIndex, setPageSubIndex } = useAdminNavigator();
    useEffect(() => {
        setPageIndex(pageIndex);
        setPageSubIndex('');
    }, [pageIndex]);
}

export function useAdminPageSubIndex(pageSubIndex: string) {
    const { setPageSubIndex } = useAdminNavigator();
    useEffect(() => {
        setPageSubIndex(pageSubIndex);
    }, [pageSubIndex]);
}

export function useAdminPageNavigator(items: AdminNavigator | { name: string; url: string }) {
    const { setAdminNavigator } = useAdminNavigator();
    const initialized = useRef(false);

    useEffect(() => {
         // 防止重複執行
        if (initialized.current) return;
        initialized.current = true;
        
        if (!items) {
            setAdminNavigator(null);
        } else if (Array.isArray(items)) {
            // If it's an array, set it directly.
            setAdminNavigator(items);
        } else {
            // If it's a single project, accumulate using callbacks.
            setAdminNavigator(prev => [
                ...(prev || []),
                items
            ]);
        }
    }, [items]);
}