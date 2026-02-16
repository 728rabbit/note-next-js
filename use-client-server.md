
## 一句話先記住

> **Next.js 預設是 Server Component**  
> **只有「一定要跑在瀏覽器」的東西，才用 `use client`**

----------

## `use client` 是什麼？

👉 告訴 Next.js：  
**「這個檔案要在瀏覽器執行」**

### 什麼情況「一定要 client」？

只要你用到下面任何一個👇

-   `useState`
    
-   `useEffect`
    
-   `useRef`
    
-   `onClick / onChange`
    
-   `window / document`
    
-   表單互動、按鈕、modal
    

### 範例

    'use client'
    
    import { useState } from 'react'
    
    export default function Counter() {
      const [count, setCount] = useState(0)
    
      return (
        <button onClick={() => setCount(count + 1)}>
          {count}
        </button>
      )
    }


❌ 沒寫 `use client` → **直接報錯**

----------

## Server Component（沒寫 `use client` 的都是）

👉 **跑在伺服器**，不是瀏覽器

### Server Component 可以做什麼？

超強：

-   直接 query DB
    
-   直接 call backend API
    
-   拿 cookie / header
    
-   不會被打包到 JS（效能好）
    

### 範例

    export default async function Page() {
      const res = await fetch('https://api.example.com/posts')
      const posts = await res.json()
    
      return (
        <ul>
          {posts.map(p => <li key={p.id}>{p.title}</li>)}
        </ul>
      )
    }


✅ 不用 `use client`  
✅ SEO 友善  
✅ 快

----------

## `use server` 是什麼？（很多人搞混）

👉 **不是 Component**  
👉 是用在 **Server Action**

### 用途

讓 **Client Component 可以直接呼叫 Server Function**

### 範例（表單最常用）

    'use server'
    
    export async function createPost(formData: FormData) {
      const title = formData.get('title')
      // 寫 DB
    }


    // Client Component
    'use client'
    
    import { createPost } from './actions'
    
    export default function Form() {
      return (
        <form action={createPost}>
          <input name="title" />
          <button type="submit">Submit</button>
        </form>
      )
    }
     

✅ 不用 API route  
✅ 不用 fetch  
✅ 官方推薦新寫法（Next 13+）

----------

## 超重要對照表（面試必背）

你想做的事

用什麼

顯示資料

Server Component

拿 DB

Server Component

SEO 頁面

Server Component

按鈕點擊

`use client`

表單互動

`use client`

表單送資料

`use server`

modal / dropdown

`use client`

----------

## 最佳實戰模式（公司都這樣寫）

`Page (Server)
 ├─ 拿資料
 └─ 傳給 Client Component
       ├─ 按鈕
       └─ 表單互動` 

👉 **Server 管資料**  
👉 **Client 管互動**


## 面試最愛問的 3 題（答案給你）

**Q1：為什麼不用全部 `use client`？**  
A：JS 會變大、效能差、SEO 差

**Q2：Server Component 能用 useState 嗎？**  
A：❌ 不行

**Q3：什麼時候用 `use server`？**  
A：Client 要直接 call server function（表單、mutation）

----------

## 給你一個判斷口訣（超好用）

> ❓ **這個功能要不要「使用者互動」？**  
> 👉 要 → `use client`  
> 👉 不要 → Server Component
