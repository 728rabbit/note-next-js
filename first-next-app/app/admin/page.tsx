'use client';

import '../../public/css/admin/common.css';
import { redirect } from 'next/navigation';
import { deleteCookie } from '../Helpers/cookies';

export default function HomePage() {
    const doLogout = () => {
        deleteCookie('admin_token');
        redirect('/admin/login');
    };

    return (
        <main>
        <section>
            <h1>Admin Home Page</h1>
            <button onClick={doLogout}>Logout</button>
        </section>
        </main>
    );
}
