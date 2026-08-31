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