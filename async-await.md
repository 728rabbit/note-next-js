## 1️⃣ 基本概念

-   **`async`**：把一個 function 變成「非同步 function」，它會**回傳 Promise**
    
-   **`await`**：停在這一行，等 Promise 完成再往下執行
    

💡 簡單口訣：

> 「`async` 說：我會慢慢回來」  
> 「`await` 說：我等你做完再繼續」

----------

## 2️⃣ 最簡單例子

    async function getData() {
      const res = await fetch('https://api.example.com/data')
      const data = await res.json()
      return data
    }
    
    getData().then(d => console.log(d))


解讀：

1.  `fetch` → 回傳 Promise
    
2.  `await` → 等 fetch 完成，拿到結果
    
3.  `await res.json()` → 解析 JSON
    
4.  最後 return → 變成 Promise 的 resolved 值



## 3️⃣ 用 async / await 代替 then
    // 用 then
    fetch('/api/data')
      .then(res => res.json())
      .then(data => console.log(data))
    
    // 用 async / await
    async function load() {
      const res = await fetch('/api/data')
      const data = await res.json()
      console.log(data)
    }
    load()


✅ 讀起來像「同步」，但底層還是非同步  
✅ 易 debug、易維護

----------

## 4️⃣ try / catch 錯誤處理

    async function load() {
      try {
        const res = await fetch('/api/data')
        if (!res.ok) throw new Error('Network error')
        const data = await res.json()
        console.log(data)
      } catch (err) {
        console.error('抓到錯誤', err)
      }
    }
    load()

💡 心法：

> 「await + try/catch = 同步寫法的錯誤捕捉」

----------

## 5️⃣ 串列多個 async

### 串行 (慢)

    const a = await  fetch('/a') 
    const b = await  fetch('/b')

### 平行 (快)

    const [a, b] = await  Promise.all([fetch('/a'), fetch('/b')]) 

💡 心法：

> 「await 不等於同時，除非用 Promise.all」
