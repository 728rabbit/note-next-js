// app/admin/left_menu.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAdminNavigator } from '../contexts/admin_navigator';
import Link from 'next/link';
import { deleteCookie } from '../Helpers/cookies';
import { redirect } from 'next/navigation';
import { useAdminUser } from '../contexts/admin_user';

export default function LeftMenu() {
    const menuItems = 
    [
        {
            type: 'single',
            key: 'page',
            label: '網站頁面',
            href: '/admin/page'
        },
        {
            type: 'single',
            key: 'herobanner',
            label: '焦點橫幅',
            href: '/admin/page/herobanner'
        },
        {
            type: 'single',
            key: 'news',
            label: '最新消息',
            href: '/admin/news'
        },
        {
            type: 'single',
            key: 'media_file',
            label: '媒體檔案',
            href: '/admin/media_file'
        },
        {
            type: 'parent',
            key: 'setting',
            label: '設置',
            children: [
                { key: 'general', label: '基本資料', href: '/admin/setting/general' },
                { key: 'sitemapxml', label: '網站XML', href: '/admin/setting/sitemapxml' },
                { key: 'third_party_code', label: '第三方代碼', href: '/admin/setting/third_party_code' },
                { key: 'sender', label: '電郵發送', href: '/admin/setting/sender' },
                { key: 'recipient', label: '電郵收件', href: '/admin/setting/recipient' },
                { key: 'whitelist', label: '白名單', href: '/admin/setting/whitelist' }
            ]
        },
        {
          type: 'parent',
          key: 'privilege',
          label: '權限',
          children: [
              { key: 'user', label: '帳戶', href: '/admin/privilege/user' },
              { key: 'roles', label: '角色', href: '/admin/privilege/role' }
          ]
        },
        {
            type: 'single',
            key: 'profile',
            label: '個人資料',
            href: '/admin/profile'
        },
        {
            type: 'single',
            key: 'website',
            label: '我的網站',
            href: '/',
            external: true
        },
        {
            type: 'single',
            key: 'logout',
            label: '登出',
        }
    ];

    const { pageIndex, pageSubIndex} = useAdminNavigator();
    const [menuExpand, setMenuExpand] = useState<Record<string, boolean>>(() => {
        const initialExpand: Record<string, boolean> = {};
        menuItems.forEach(item => {
            if (item.children) {
                initialExpand[item.key] = (pageIndex === item.key);
            }
        });
        return initialExpand;
    });

    const shouldShowMenu = (item: typeof menuItems[0]) => {
        if (!item.children) { return false };
        return (menuExpand[item.key] || false);
        // return menuExpand[item.key] || (pageIndex === item.key);
    };

    // Optional
    useEffect(() => {
        setMenuExpand(prev => {
            const newExpand = { ...prev };
            menuItems.forEach(item => {
                if (item.children) {
                    if (pageIndex === item.key && !newExpand[item.key]) {
                        newExpand[item.key] = true;
                    }
                }
            });
            return newExpand;
        });
    }, [pageIndex]); 
    

    function toggleMenu(menuKey: string) {
         setMenuExpand(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    }

    const { setAdminUser } = useAdminUser();
    const doLogout = () => {
        deleteCookie('admin_token');
        setAdminUser(null);
        redirect('/admin/login');
    };
    
    return (
        <aside className="left-menu">
            <ul>
            {
                menuItems.map(item => 
                <li className={item.key} key={item.key}>
                    {
                        ((item.key === 'logout') ? (
                            <Link href={item.href??'#'}
                                onClick={() => doLogout()}>
                                <span>{item.label}</span>
                            </Link>
                        )
                        : 
                        (
                            <>
                                <Link href={item.href??'#'} className={((item.children) ? 'parent' :'') + ((pageIndex === item.key) ? ' current': '')}
                                    onClick={() => toggleMenu(item.key)}>
                                    <span>{item.label}</span>
                                </Link>
                                { 
                                    item.children && (
                                        <ol style={{display: (shouldShowMenu(item) ? 'block': 'none')}}>
                                            {
                                                item.children.map(child_item => 
                                                <li className={child_item.key} key={child_item.key}>
                                                    <Link href={child_item.href??'#'} className={((pageSubIndex === child_item.key) ? 'current': '')}>
                                                        <span>{child_item.label}</span>
                                                    </Link>
                                                </li>
                                                )
                                            }
                                        </ol>
                                    )
                                }
                            </>
                        ))
                    }
                </li>
                )
            }
            </ul>
        </aside>
    );
}