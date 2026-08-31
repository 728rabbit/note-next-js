/*
import { getUserList } from "./database/query";

export default async function () {
   const users = await getUserList();
   ...

   return (
        <ul>
        {users.map(user => (
            <li key={user.id}>{user.display_name} ({user.email})</li>
        ))}
        </ul>
    );
}
*/
import { db } from "./connection";

export async function getUserList() {
    const listData = await db
        .selectFrom('app_user')
        .select(['id', 'display_name', 'email'])
        .where('status', '>=', 1)
        .orderBy('created_at', 'desc')
        .execute();

    return listData;
}

export async function getPageList(tableName: string = 'app_user') {
     return await db
        .selectFrom(tableName  as any)
        .selectAll()
        .execute();
}