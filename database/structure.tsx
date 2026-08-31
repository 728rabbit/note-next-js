import { Generated } from "kysely";

interface AppUserTable {
    id: Generated<number>;       // int(11) AUTO_INCREMENT (主鍵自動生成)
    role_id: number;             // int(11)
    root_user: number;           // tinyint(4)
    display_name: string | null; // varchar(200) Null=Yes
    name: string | null;         // varchar(200) Null=Yes
    telephone: string | null;    // varchar(200) Null=Yes
    email: string | null;        // varchar(200) Null=Yes
    password: string | null;     // text Null=Yes
    remark: string | null;       // text Null=Yes
    status: number;              // tinyint(4) Default=1
    single_mode: number;         // tinyint(4) Default=0
    last_login_at: string | null; // datetime Null=Yes (mysql2 預設會將 datetime 轉為 string 或 Date，依連線設定而定)
    created_by: number;          // int(11) Default=0
    created_at: string | null;   // datetime Null=Yes
    updated_by: number;          // int(11) Default=0
    updated_at: string | null;   // datetime Null=Yes
    deleted_by: number;          // int(11) Default=0
    deleted_at: string | null;   // datetime Null=Yes
}

export interface Database {
    app_user: AppUserTable
}
