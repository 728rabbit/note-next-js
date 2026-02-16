
## 1️⃣ 基本概念

在 React / Next.js 裡，要 **渲染陣列**（例如從 API 拿到的資料）最常用 `map`：

    const items = ['Apple', 'Banana', 'Orange']
    
    function FruitList() {
      return (
        <ul>
          {items.map(item => <li>{item}</li>)}
        </ul>
      )
    }


✅ 問題：React 會警告

> Each child in a list should have a unique "key" prop

----------

## 2️⃣ 加上 key（必須）

`key` 是 React 用來**追蹤元素變化**的，尤其更新列表時，效能超級重要。

    const items = ['Apple', 'Banana', 'Orange']
    
    function FruitList() {
      return (
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )
    }


💡 面試口訣：

> 「map → 每個元素要 key，不要用 index 做永遠唯一值除非資料不會變」

----------

## 3️⃣ map + object

實務上常用物件陣列：

    const users = [
      { id: 1, name: 'Ken' },
      { id: 2, name: 'Lucy' },
    ]
    
    function UserList() {
      return (
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )
    }

✅ 注意：這裡用 `user.id` 做 key，比 index 更安全

----------

## 4️⃣ map + component

你可以直接把每個元素變成一個 Component：

    function User({ name }) {
      return <li>{name}</li>
    }
    
    function UserList() {
      return (
        <ul>
          {users.map(user => (
            <User key={user.id} name={user.name} />
          ))}
        </ul>
      )
    }


💡 心法：

> map = 「陣列 → 多個 React 元素」

----------

## 5️⃣ map + conditional render

可以搭配條件渲染：

    const users = [
      { id: 1, name: 'Ken', active: true },
      { id: 2, name: 'Lucy', active: false },
    ]
    
    function ActiveUsers() {
      return (
        <ul>
          {users
            .filter(u => u.active)
            .map(u => <li key={u.id}>{u.name}</li>)
          }
        </ul>
      )
    }


💡 面試口訣：

> 「想挑元素先 filter，再 map 生成元素」

----------

## 6️⃣ 小技巧：多層 map

    const posts = [
      { id: 1, title: 'Post 1', tags: ['react', 'js'] },
      { id: 2, title: 'Post 2', tags: ['next', 'css'] },
    ]
    
    function Posts() {
      return (
        <div>
          {posts.map(post => (
            <div key={post.id}>
              <h3>{post.title}</h3>
              <ul>
                {post.tags.map(tag => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )
    }

💡 心法：

> map 可以巢狀使用，但每層 key 都要唯一

----------

### ✅ 面試必背口訣

1.  **map = 陣列 → React 元素**
    
2.  **每個元素要 key**
    
3.  **物件陣列 key 用 id，index 只在不變的列表才用**
    
4.  **可以和 filter / conditional 搭配**
