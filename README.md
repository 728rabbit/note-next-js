
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


 ### 🗂️ 核心目录结构 (树状图)

这是一个最常见的 Next.js 项目结构示例，你可以看到 `app` 目录作为核心，通过文件夹和特殊文件来组织路由

    text
    
    my-next-app/
    ├── app/                    # 应用主目录，基于此进行路由
    │   ├── layout.tsx          # 根布局 (必须存在，包裹所有页面)[citation:6][citation:8]
    │   ├── page.tsx            # 首页，对应路径 '/'[citation:5]
    │   ├── globals.css         # 全局样式文件
    │   │
    │   ├── (marketing)/        # 路由组，路径中不显示 'marketing'[citation:4][citation:5]
    │   │   ├── layout.tsx      # 为 'marketing' 组下的页面提供特定布局
    │   │   ├── about/
    │   │   │   └── page.tsx    # 对应路径 '/about'
    │   │   └── contact/
    │   │       └── page.tsx    # 对应路径 '/contact'
    │   │
    │   ├── dashboard/          # 路径段 '/dashboard'
    │   │   ├── layout.tsx      # 为 '/dashboard' 下的所有页面提供布局
    │   │   ├── page.tsx        # 对应路径 '/dashboard'
    │   │   ├── loading.tsx     # 加载 '/dashboard' 时的 UI[citation:3]
    │   │   ├── error.tsx       # '/dashboard' 下的错误边界 UI[citation:5]
    │   │   ├── settings/
    │   │   │   └── page.tsx    # 对应路径 '/dashboard/settings'
    │   │   └── @analytics/     # 并行路由 (平行路由) 插槽
    │   │       └── page.tsx
    │   │
    │   ├── blog/               # 路径段 '/blog'
    │   │   ├── page.tsx        # 对应路径 '/blog'
    │   │   └── [slug]/         # 动态路由，匹配 '/blog/任意值'[citation:6]
    │   │       └── page.tsx    # 例如 '/blog/hello-world' 会由这个文件渲染
    │   │
    │   └── api/                # API 路由目录
    │       └── hello/
    │           └── route.ts    # 对应路径 '/api/hello'[citation:3]
    │
    ├── public/                 # 静态资源目录 (图片、字体等)
    ├── next.config.js          # Next.js 配置文件
    └── package.json            # 项目依赖和脚本

** 模擬延遲

await new Promise((resolve) => setTimeout(resolve, 5000));
