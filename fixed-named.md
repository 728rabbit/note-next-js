
# Next.js App Router 固定檔名整理（Next 13+）

## 1. Page / Route

| 類別 | 固定名稱 | 功能 / 說明 | 可否改名 |
|------|-----------|------------|-----------|
| Page / Route | `page.tsx` / `page.js` | 渲染頁面組件 → 對應 URL | ❌ 必須 |
| Layout | `layout.tsx` / `layout.js` | 包裹子頁面共用 Layout（header/footer/nav） | ❌ 必須 |
| API Route | `route.ts` / `route.js` | API 進入點 → 對應資料夾路徑，export GET/POST/PUT/DELETE | ❌ 必須 |
| Error Boundary | `error.tsx` | 捕獲 layout/page 內的錯誤 | ❌ 固定名稱 |
| Loading | `loading.tsx` | Suspense 加載指示組件 | ❌ 固定名稱 |
| Template | `template.tsx` | 每次進入頁面都重新 mount 的 Layout | ❌ 固定名稱 |
| Head / Metadata | `head.tsx` | 設定頁面 `<head>` metadata | ❌ 固定名稱 |
| Not Found | `not-found.tsx` | 404 專用頁面 | ❌ 固定名稱 |

---

## 2. Global / Config / Env

| 類別 | 固定名稱 | 功能 / 說明 | 可否改名 |
|------|-----------|------------|-----------|
| Global CSS | `globals.css` | 全域樣式 | ❌ 固定名稱 |
| Favicon / 公共資源 | `favicon.ico` | 公共資源 | ❌ 固定名稱 |
| Middleware | `middleware.ts` | 全域或指定路由前置處理 | ❌ 固定名稱 |
| Next.js Config | `next.config.js` | 專案設定 | ❌ 固定名稱 |
| 環境變數 | `.env.local`, `.env` | 環境變數 | ❌ 固定名稱 |

---

## 3. API Route 補充說明

1. 路由對應資料夾：
   ```txt
   /app/api/login/route.ts        → /api/login
   /app/api/users/route.ts        → /api/users
   /app/api/users/[id]/route.ts   → /api/users/:id (動態路由)
   /app/api/users/[...slug]/route.ts → /api/users/* (catch-all)

2.  route.ts 裡 export HTTP method：
    
    `export  async  function  GET(req: Request) { ... } export  async  function  POST(req: Request) { ... } export  async  function  PUT(req: Request) { ... } export  async  function  DELETE(req: Request) { ... }` 
    

----------

## 4. 心法整理

-   `page.tsx` / `layout.tsx` / `route.ts` → 核心固定檔，必須存在
    
-   `error.tsx` / `loading.tsx` / `template.tsx` / `head.tsx` / `not-found.tsx` → 可選但有固定用途
    
-   `middleware.ts` / `next.config.js` / `globals.css` → 專案級固定檔
    
-   檔案命名錯誤 → 對應頁面或 API route 不會生效
    

----------

## 5. 面試口訣

> 「App Router 裡 URL 對應資料夾 + `page.tsx` / `route.ts`，`layout.tsx` 是 Layout，`middleware.ts` 做前置處理，其餘固定檔名（`error.tsx` / `loading.tsx` / `head.tsx` / `template.tsx` / `not-found.tsx`）按規範就能被框架自動識別」
