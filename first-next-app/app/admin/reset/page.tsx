import type { Metadata } from 'next'


export async function generateMetadata() {
  
  return {
    title: '用戶登入',
    description: '歡迎光臨',
  };
}

export default function ResetPage() {
  return (
    <main>
      <section>
        <h1>用戶登入</h1>
        <p>這是一個使用 Next.js 14 的現代網站</p>
      </section>
    </main>
  )
}