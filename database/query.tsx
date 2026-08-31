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
import { db, ddb } from "./connection";

export async function getUserList() {
    const listData = await db
        .selectFrom('app_user')
        .select(['id', 'display_name', 'email'])
        .where('status', '>=', 1)
        .orderBy('created_at', 'desc')
        .execute();

    return listData;
}

export async function getList<T = any>(tableName: string = 'app_user', columns?: string[]): Promise<T[]> {
    let query = ddb.selectFrom(tableName as any);

    if (columns && columns.length > 0) {
        query = query.select(columns.map(col => ddb.dynamic.ref(col)));
    }
    else {
        query = query.selectAll();
    }

     return await query.execute() as T[];
}