import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '首頁 | 我的網站',
  description: '歡迎光臨',
}

export default function LoginPage() {
    return (
        <main>
            <section>
              <h1>Admin Login Page</h1>
              <p>這是一個使用 Next.js 14 的現代網站</p>
            </section>
        </main>
    )
}