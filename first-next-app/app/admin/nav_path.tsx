// app/admin/nav_path.tsx
'use client';

import Link from 'next/link';
import { useAdminNavigator } from '../contexts/admin_navigator';

export default function NavPath() {
    const { adminNavigator } = useAdminNavigator();

    return (
        adminNavigator && (
            <nav className="path">
                <div>
                    <ul>
                        {
                            adminNavigator.map((item, index) => {
                                const elements = [];
                                
                                if (index !== 0) {
                                    elements.push(<li key={`separator-${index}`}>&gt;</li>);
                                }
                                
                                elements.push(
                                    <li key={index}>
                                        <Link href={item.url}>{item.name}</Link>
                                    </li>
                                );
                                
                                return elements;
                            })
                        }
                        </ul>
                </div>
            </nav>
        )
    );
}
