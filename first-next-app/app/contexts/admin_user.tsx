// app/contexts/admin_user.tsx
'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Admin user type
type AdminUser = { id: number; name: string; email: string } | null

interface UserContextType {
    adminUser: AdminUser,
    setAdminUser: (u: AdminUser) => void  // This function accepts one argument named 'u', which is of type AdminUser.
}

// Create Context
const UserContext = createContext<UserContextType | undefined>(undefined)

// Provider Component
export function AdminProvider({ children }: { children: ReactNode }) {
    const [adminUser, setAdminUser] = useState<AdminUser>(null);

    useEffect(() => {
        const fetchAdminUser = async () => {
            try {
                const res = await fetch('/api/admin');
                const data = await res.json();
                if (data.user) {
                    setAdminUser(data.user);
                }
            } catch(e) {
                console.error('Failed to fetch admin user:', e);
            }
        };

        fetchAdminUser();
    }, []);

    console.log('Current user:', adminUser);

    return (
        <UserContext.Provider value={{ adminUser, setAdminUser }}>
            {children}
        </UserContext.Provider>
    );
}

// Custom hook
export const useAdminUser = () => {
    const ctx = useContext(UserContext);
    if (!ctx) {
        throw new Error('useAdminUser must be used within AdminProvider');
    }
    return ctx;
}