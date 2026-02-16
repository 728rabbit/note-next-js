'use client';

import { useEffect } from 'react';
import { useAdminUser } from '../contexts/adminuser';
import Link from 'next/link';

export default function Header() {
    const { user, setUser } = useAdminUser();

    useEffect(() => {
        if(!user) {
            fetch('/api/admin')
            .then(res => res.json())
            .then(data => data.user && setUser(data.user));
        }
    }, []);

    return (
        <header className="page-header">
            <div className="logo">
                <Link href="http://localhost/laravel-project-8/admin/home">
                    <span>網站管理平臺<br/><small>Website Management</small></span>
                </Link>
            </div>
            <div className="open">
                <a><i className="fa fa-indent" aria-hidden="true"></i></a>
            </div>
                <div className="welcome">
                <Link href="http://localhost/laravel-project-8/admin/profile">Hi, <u>{user?.name}</u></Link>
            </div>
        </header>
    );
}
