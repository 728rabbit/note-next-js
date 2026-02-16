import Link from 'next/link';

export default function LeftMenu() {
    const menuItems = [
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
      href: '/api/auth/logout'
    }
  ];

  return (
        <aside className="left-menu">
            <ul>
            {menuItems.map(item => 
                <li className="page" key={item.key}>
                    <Link href={item.href??'#'}>{item.label}</Link>
                </li>
            )}
            </ul>
        </aside>
    );
}