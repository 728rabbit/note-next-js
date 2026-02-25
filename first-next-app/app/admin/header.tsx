'use client';
import Link from 'next/link';
import { useAdminUser } from '../contexts/admin_user';

export default function Header() {
    const { adminUser } = useAdminUser();

    return (
        <header className="page-header">
            <div className="logo">
                <Link href="/admin">
                    <span>網站管理平臺<br/><small>Website Management</small></span>
                </Link>
            </div>
            <div className="open">
                <a><i className="fa fa-indent" aria-hidden="true"></i></a>
            </div>
                <div className="welcome">
                <Link href="/admin/profile">Hi, <u>{adminUser?.name}</u></Link>
            </div>
        </header>
    );
}
