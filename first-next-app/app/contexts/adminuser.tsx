'use client'

import { createContext, useContext, useState, ReactNode } from 'react';

// Admin user type
type User = { id: number; name: string; email: string } | null

interface UserContextType {
    user: User,
    setUser: (u: User) => void
}

// Create Context
const UserContext = createContext<UserContextType | undefined>(undefined)

// Provider Component, React components must start with a capital letter.
export function AdminProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User>(null)

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

// Hook is used to read Admin User in child components
export const useAdminUser = () => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useAdminUser must be inside AdminProvider');
    return ctx;
}