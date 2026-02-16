
## 1️⃣ 基本概念

登入與權限其實就是兩件事：

1.  **登入（Authentication）**：誰是你 → 拿 token / cookie / session
    
2.  **權限（Authorization）**：你能做什麼 → 控制頁面 / API 訪問
    

在 Next.js 裡通常分三層：

    Client Component (View)
     └─ 登入表單、UI
    Server Component / Server Action (Controller + Model)
     └─ 驗證帳號密碼、寫 cookie / JWT
    Middleware / Protect Route
     └─ 控制誰能進哪個頁面


----------

## 2️⃣ 登入流程（最簡單）

### 前端表單

    'use client'
    import { useState } from 'react'
    import { useRouter } from 'next/navigation'
    
    export default function LoginForm() {
      const [email, setEmail] = useState('')
      const [password, setPassword] = useState('')
      const router = useRouter()
    
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
          headers: { 'Content-Type': 'application/json' },
        })
        const data = await res.json()
        if (data.success) router.push('/admin')
        else alert('Login failed')
      }
    
      return (
        <form onSubmit={handleSubmit}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit">Login</button>
        </form>
      )
    }


----------

### 後端驗證（API Route / Server Action）

   

     // /api/login/route.ts
        import { NextResponse } from 'next/server'
        
        export async function POST(req: Request) {
          const { email, password } = await req.json()
          
          // 模擬驗證
          if (email === 'admin@test.com' && password === '1234') {
            const res = NextResponse.json({ success: true })
            res.cookies.set('admin_token', 'FAKE_TOKEN', { httpOnly: true })
            return res
          }
          
          return NextResponse.json({ success: false })
        }
    
     假設你有一個遠程 API `https://auth.example.com/login`：
    
    // /api/login/route.ts
    import { NextResponse } from 'next/server'
    
    export async function POST(req: Request) {
      const { email, password } = await req.json()
    
      // call 遠程 API
      const res = await fetch('https://auth.example.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
    
      const data = await res.json()
    
      if (data.success) {
        const response = NextResponse.json({ success: true })
        response.cookies.set('admin_token', data.token, { httpOnly: true })
        return response
      }
    
      return NextResponse.json({ success: false })
    }

----------

## 3️⃣ 權限保護（Middleware）

Next.js 的 **middleware** 可以保護頁面（Server Component 或 API）：

    // middleware.ts
    import { NextResponse } from 'next/server'
    import type { NextRequest } from 'next/server'
    
    export function middleware(req: NextRequest) {
      const token = req.cookies.get('admin_token')?.value
      const url = req.nextUrl.clone()
    
      if (!token && url.pathname.startsWith('/admin')) {
        url.pathname = '/admin/login'
        return NextResponse.redirect(url)
      }
    
      return NextResponse.next()
    }

 

💡 心法：

-   **登入成功 → 寫 cookie / JWT**
    
-   **訪問受保護頁 → middleware 檢查 token**
    

----------

## 4️⃣ 前端頁面保護（Client Component 補充）

有時候頁面內還要判斷權限：

    'use client'
    import { useEffect, useState } from 'react'
    import { useRouter } from 'next/navigation'
    
    export default function AdminHome() {
      const [loading, setLoading] = useState(true)
      const router = useRouter()
    
      useEffect(() => {
        fetch('/api/check-token').then(res => res.json()).then(data => {
          if (!data.valid) router.push('/admin/login')
          else setLoading(false)
        })
      }, [])
    
      if (loading) return <div>Loading...</div>
      return <div>Welcome Admin!</div>
    }

----------

## 5️⃣ 面試必背口訣

功能

做法 / 技巧

登入

前端表單 + API / Server Action

驗證

後端比對帳號密碼

Session / Token

HttpOnly cookie / JWT

權限保護頁面

Middleware / Server Component check

權限保護 API

Middleware 或 Server Action check

----------

## 6️⃣ 心法（面試/實戰都用）

-   **Server Component / API / Server Action** → 驗證、拿資料
    
-   **Client Component** → 表單、按鈕、UI 互動
    
-   **Middleware** → 全站 / 指定路徑保護
    
-   **Cookie / JWT** → 身份 token，HTTP Only 最安全
    

----------

💡 小結：  
Next.js 的登入 + 權限管理其實就是 **MVC 思維搬到前端**：

`Client Component = View
Server Action / API = Controller
DB / Model = Model
Middleware = route guard / filter`
