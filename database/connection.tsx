import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';
import { Database } from './structure';

// Solve the problem of hot reload in Next.js development mode causing the connection to be full
const globalForKysely = globalThis as unknown as { db: Kysely<Database> };

export const db =
    globalForKysely.db ||
    new Kysely<Database | any>({
        dialect: new MysqlDialect({
            pool: createPool({
                host: process.env.DATABASE_HOST || '127.0.0.1',
                user: process.env.DATABASE_USER || 'root',
                password: process.env.DATABASE_PASSWORD || '',
                database: process.env.DATABASE_NAME || 'defaultcms',
                port: 3306,
                waitForConnections: true,
                connectionLimit: 10, // Connection pool size
                queueLimit: 0,
            })
        })
    });

if (process.env.NODE_ENV !== 'production') { globalForKysely.db = db; }
