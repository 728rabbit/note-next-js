# Next.js 登入 + 全局 userData 管理範例

## 1️⃣ 建立 Context（全局 userData）

    // app/context/UserContext.tsx
    'use client'
    import { createContext, useContext, useState, ReactNode } from 'react'
    
    type User = { id: number; name: string; email: string } | null
    
    interface UserContextType {
      user: User
      setUser: (u: User) => void
    }
    
    const UserContext = createContext<UserContextType | undefined>(undefined)
    
    export function UserProvider({ children }: { children: ReactNode }) {
      const [user, setUser] = useState<User>(null)
    
      return (
        <UserContext.Provider value={{ user, setUser }}>
          {children}
        </UserContext.Provider>
      )
    }
    
    export const useUser = () => {
      const ctx = useContext(UserContext)
      if (!ctx) throw new Error('useUser must be inside UserProvider')
      return ctx
    }


----------

## 2️⃣ 包裹全局 Layout

    // app/layout.tsx
    import { UserProvider } from './context/UserContext'
    
    export default function RootLayout({ children }: { children: React.ReactNode }) {
      return (
        <html lang="en">
          <body>
            <UserProvider>{children}</UserProvider>
          </body>
        </html>
      )
    }


----------

## 3️⃣ 登入表單（Client Component）

// app/admin/login/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '../../context/UserContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { setUser } = useUser()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    if (data.success) {
      setUser(data.user)          // 設置全局 userData
      router.push('/admin/home')  // 登入成功跳轉
    } else {
      alert('Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  )
}


----------

## 4️⃣ API Route /api/login/route.ts（可呼叫遠程 API）

    // app/api/login/route.ts
    import { NextResponse } from 'next/server'
    
    export async function POST(req: Request) {
      const { email, password } = await req.json()
    
      // 模擬遠程 API call
      // 你也可以換成 fetch('https://auth.example.com/login', ...)
      if (email === 'admin@test.com' && password === '1234') {
        const user = { id: 1, name: 'Ken', email }
    
        const res = NextResponse.json({ success: true, user })
        res.cookies.set('admin_token', 'FAKE_TOKEN', { httpOnly: true })
        return res
      }
    
      return NextResponse.json({ success: false })
    }


----------

## 5️⃣ Middleware 保護頁面

    // middleware.ts
    import { NextResponse } from 'next/server'
    import type { NextRequest } from 'next/server'
    
    export function middleware(req: NextRequest) {
      const token = req.cookies.get('admin_token')?.value
      const url = req.nextUrl.clone()
    
      if (!token && url.pathname.startsWith('/admin') && url.pathname !== '/admin/login') {
        url.pathname = '/admin/login'
        return NextResponse.redirect(url)
      }
    
      return NextResponse.next()
    }
    
    export const config = {
      matcher: '/admin/:path*'
    }


----------

## 6️⃣ Header 讀取全局 userData

// app/components/Header.tsx
'use client'
import { useUser } from '../context/UserContext'

export default function Header() {
  const { user } = useUser()
  return (
    <header>
      {user ? `Hello, ${user.name}` : 'Please login'}
    </header>
  )
}


----------

✅ 現在流程完整：

1.  前端表單 submit → `/api/login`
    
2.  API call 遠程 API 或本地驗證
    
3.  設置 HttpOnly cookie
    
4.  登入成功後 `setUser(userData)` → 全局 Context
    
5.  任何子組件都可用 `useUser()` 讀取 userData
    
6.  Middleware 保護受限頁面
