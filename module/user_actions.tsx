'use server';

import { revalidatePath } from "next/cache";
import { doSave, getList, updateOne } from "../database/query";
import { PaginatedResult } from "../database/structure";

export interface User {
  id: number;
  display_name: string;
  email: string;
}

export async function getUserList() : Promise<PaginatedResult<User>> {
  return (await getList('app_user', {
    fields: ['id', 'display_name', 'email'],
    filters: [['status', '=', 1]],
    pagination: { page: 1, limit: 15 },
    orderBy: { column: 'id', direction: 'desc' },
  })) as PaginatedResult<User>;
}

export async function addNewUser(formData: FormData) {
    const display_name = String(formData.get("display_name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    if (!display_name || !email) throw new Error("Missing fields");
    await doSave('app_user',
      { email: email, display_name: display_name },
      { filters: [['email', '=', email]] }
    );
    revalidatePath('/');
}

export async function deleteUser(id : number) {
    await updateOne('app_user',
        { status: 0 },
        { filters: [['id', '=', id]] }
    );
    revalidatePath('/');
}