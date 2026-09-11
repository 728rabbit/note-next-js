/*
import { getUserList } from "./module/user_actions";
import UserListView from "./module/user_listview";

export default async function Page() {
  const result = await getUserList();
  return <UserListView result={result} />;
}
*/
'use client';

import { PaginatedResult } from "../database/structure";
import { addNewUser, deleteUser } from "./user_actions";

interface User {
  id: number;
  display_name: string;
  email: string;
}

export default function UserListView({ result }: { result: PaginatedResult<User> }) {
    return (
        <div>
          <h1>User List</h1>
          <p>Total {result.total} Users</p>
          <ul>
            {result.data.map((u: User) => (
              <li key={u.id}>
                {u.display_name} ({u.email})
                <button type="button" onClick={() => deleteUser(u.id)}>刪除用戶</button>
            </li>
            ))}
          </ul>
            <form action={addNewUser}>
                <button type="submit">新增用戶</button>
            </form>
        </div>
      );
}