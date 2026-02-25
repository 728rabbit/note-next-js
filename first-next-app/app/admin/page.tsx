// app/admin/page.tsx
'use client';

import { useAdminNavigator, useAdminPageIndex, useAdminPageNavigator } from '../contexts/admin_navigator';

export default function HomePage() {
    useAdminPageIndex('page');
    useAdminPageNavigator({ name: '網站頁面', url: '/admin' });

    return (
        <main>
            <section>
                <h1>Admin Home Page</h1>
            </section>
        </main>
    );
}
