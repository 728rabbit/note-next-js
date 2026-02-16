
登入後在整個應用中 **全局讀取 user 資料**（userData），常見方案有三種，我幫你整理成 **實戰可上崗版本**👇

## 1️⃣ 方法概覽

方法 | 優缺點 | 適用場景

React Context  | 全 React 層級共享  | 小中型專案、前端狀態

Zustand / Jotai / Redux | 更強大的狀態管理 | 中大型專案、多人協作

Server Component + fetch user | Server 渲染每次拿最新 user | 重 SEO / SSR / 安全需求


## 2️⃣ 方法 1：React Context（最常用 + 上手快）

### Step 1：建立 UserContext

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

### Step 2：包在全局（app/layout.tsx 或 pages/_app.tsx）

    import { UserProvider } from '../contexts/UserContext'
    
    export default function RootLayout({ children }: { children: React.ReactNode }) {
      return (
        <html>
          <body>
            <UserProvider>{children}</UserProvider>
          </body>
        </html>
      )
    }


----------

### Step 3：登入後設定 userData

    'use client'
    import { useUser } from '../contexts/UserContext'
    
    async function handleLogin() {
      const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify(form) })
      const data = await res.json()
      if (data.success) {
        setUser(data.user) // ← 設定全局 userData
      }
    }

----------

### Step 4：在任何子元件讀取 userData

    'use client'
    import { useUser } from '../contexts/UserContext'
    
    export default function Header() {
      const { user } = useUser()
    
      return <div>{user ? `Hello, ${user.name}` : 'Please login'}</div>
    }

----------

## 3️⃣ 方法 2：Zustand / Redux（更強大）

    import { create } from 'zustand'
    
    export const useUserStore = create(set => ({
      user: null,
      setUser: (u) => set({ user: u }),
    }))

使用：

`const { user, setUser } = useUserStore()` 

✅ 優點：全局共享，不用 Provider 層層包  
✅ 適合大型專案

----------

## 4️⃣ 方法 3：Server Component + fetch

如果你的資料來自 **後端 API / token**：

    export default async function Header() {
      const res = await fetch('https://your-backend.com/api/me', { cache: 'no-store' })
      const user = await res.json()
    
      return <div>{user?.name ?? 'Guest'}</div>
    }


✅ 優點：安全、SSR、永遠最新  
❌ 缺點：client component 互動沒辦法直接拿，需要 prop 或 context

----------

## 🔑 心法

1.  **Client Component → React Context / Zustand**（互動、快速反應）
    
2.  **Server Component → fetch user**（SSR、SEO、安全）
    
3.  登入後：
    
    -   設定 **全局狀態**（Context / Store）
        
    -   或用 **cookie / token** → Server Component fetch
        

----------

💡 面試口訣：

> 「登入後，userData 全局管理常用 Context 或 Zustand，Server Component 可以 fetch 保持最新，兩者結合最實戰」




