/*
import { getUserList } from "./module/user_actions";
import UserListView from "./module/user_listview";

export default async function Page() {
  const result = await getUserList();
  return <UserListView result={result} />;
}
*/
'use client';

import { useFormStatus } from "react-dom";
import { PaginatedResult } from "../database/structure";
import { addNewUser, deleteUser } from "./user_actions";

interface User {
  id: number;
  display_name: string;
  email: string;
}

export default function UserListView({ result }: { result: PaginatedResult<User> }) {
    const { pending } = useFormStatus();

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
                <input type="text" name="display_name" placeholder="Display Name" required />
                <input type="text" name="email" placeholder="Email" required />
                <button type="submit" disabled={pending}> {pending ? 'Adding...' : 'Add User'}</button>
            </form>
        </div>
      );
}