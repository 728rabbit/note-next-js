
# Note Next.js

一個以學習為目的的 Next.js 筆記專案，從零開始實作簡單的 CRUD 筆記功能，幫助熟悉 Next.js 與 React 的開發流程。

Tech Stack:

- Next.js 16+
- React
- TypeScript (optional)


Server Actions (functions marked with 'use server') have specific rules:

✅ CAN be called from Client Components in:

 - Event handlers (onClick, onSubmit, etc.)
   
  - Form actions (`<form action={serverAction}>`)
   
   - Transitions (with useTransition)

❌ CANNOT be called from Client Components in:

 - useEffect hooks
   
 - Component lifecycle methods
   
 - Async callbacks not tied to user actions


 Server Action 中，不能直接返回原始類型，需要返回一個可以序列化的對象。
