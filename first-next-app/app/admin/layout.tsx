
import Link from 'next/link';
import { AdminProvider } from '../contexts/adminuser';
import Header from './header';
import LeftMenu from './leftmenu';

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="adminPanel">   
            <AdminProvider>
                <Header/>
                <LeftMenu/>
                <nav className="path">
                    <div>
                        <ul>
                            <li><Link href="http://localhost/laravel-project-8/admin/page">網站頁面</Link></li>
                        </ul>
                    </div>
                </nav>
                <main className="page-body">
                    <div className="page-message iweby-tips-message" data-offset="180"></div>
                    <div className="page-content page">
                        <div>{children}</div>
                    </div>
                </main>
            </AdminProvider>
        </div>
    );
};