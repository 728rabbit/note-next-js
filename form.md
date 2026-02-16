
## 1️⃣ 基本概念

React 表單不是傳統 HTML 表單那樣自動送資料，需要 **state + onChange + onSubmit**。

import { useState } from 'react'

function SimpleForm() {
  const [name, setName] = useState('')  // 管理 input 狀態

  const handleSubmit = (e) => {
    e.preventDefault()  // 阻止表單刷新頁面
    console.log('Submitted:', name)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)} // 綁定 input
        placeholder="Enter name"
      />
      <button type="submit">Submit</button>
    </form>
  )
}


----------

## 2️⃣ 核心概念對照

功能

React 做法

面試口訣

輸入框

`value + onChange`

Controlled Component

按鈕送出

`onSubmit` + `e.preventDefault()`

阻止 page reload

讀值

state

state 永遠是 source of truth

清空

`setState('')`

submit 後可選

----------

## 3️⃣ 多個 input

    const [form, setForm] = useState({ email: '', password: '' })
    
    const handleChange = (e) => {
      setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }
    
    <form onSubmit={handleSubmit}>
      <input name="email" value={form.email} onChange={handleChange} />
      <input name="password" value={form.password} onChange={handleChange} />
      <button type="submit">Login</button>
    </form>

💡 心法：

> 「一個 handleChange，動態更新對應欄位」

----------

## 4️⃣ 搭配 async / await 送 API（Next.js 實戰）

    async function handleSubmit(e) {
      e.preventDefault()
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify(form),
          headers: { 'Content-Type': 'application/json' }
        })
        const data = await res.json()
        console.log('Login result:', data)
      } catch (err) {
        console.error(err)
      }
    }


✅ 這就是你在 Next.js 實戰裡會用的模式：

> Controlled form + async submit → API route → DB / Server

----------

## 5️⃣ 面試必背口訣

1.  **Controlled Component**：value + onChange
    
2.  **阻止頁面刷新**：`e.preventDefault()`
    
3.  **多欄位用物件 state**：`setForm({...form, [name]: value})`
    
4.  **submit async**：fetch / axios / use server action
