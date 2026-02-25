// app/admin/layout.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { AdminProvider, useAdminUser } from '../contexts/admin_user';
import { AdminNavigatorProvider } from '../contexts/admin_navigator';

import Header from './header';
import LeftMenu from './left_menu';
import NavPath from './nav_path';

import '../../public/css/admin/common.css';

function AdminLayoutContent({ children } : { children: React.ReactNode } ) {
    const { adminUser } = useAdminUser();
    const [isLoading, setIsLoading] = useState(true);
    
    console.log('current user:', adminUser);

    // Delayed display to avoid flickering
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        
        return () => clearTimeout(timer);
    }, [adminUser]);

    if (isLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                height: '100vh', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '1.25rem',
                fontWeight: 700 
            }}>
                載入中...
            </div>
        );
    }

    // Not logged in
    if (!adminUser) {
        return (
            <main className="page-body full">
                <div className="page-content page">
                    <div>{children}</div>
                </div>
            </main>
        );
    }
    
    // Logged in
    return (
        <>
            <Header/>
            <LeftMenu/>
            <NavPath/>
            <main className="page-body">
                <div className="page-message iweby-tips-message" data-offset="180"></div>
                <div className="page-content page">
                    <div>{children}</div>
                </div>
            </main>
        </>
    );
}

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="adminPanel">   
            <AdminProvider>
                <AdminNavigatorProvider>
                    <AdminLayoutContent>
                        {children}
                    </AdminLayoutContent>
                </AdminNavigatorProvider>
            </AdminProvider>
        </div>
    );
}