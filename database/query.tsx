import { ddb } from "./kyselydb";
import { Transaction, Kysely } from "kysely";
import { PaginatedResult } from "./structure";

const isMySQL = true;

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Options for fetching a list of records
 * @template T - The record type
 */
export interface GetListOptions<T = any> {
    /** Specific columns to select. If omitted, all columns are selected. */
    fields?: (keyof T)[] | string[];

    /**
     * Filter conditions - either an array of [key, operator, value] tuples
     * or a Kysely expression builder function.
     */
    filters?: [string, string, any][] | ((qb: any) => any);

    /** Sorting configuration - single or multiple columns. */
    orderBy?: { column: string; direction?: "asc" | "desc" }
        | Array<{ column: string; direction?: "asc" | "desc" }>;

    /** Pagination settings. */
    pagination?: {
        page?: number;
        limit?: number;
        offset?: number;
    };

    /** Return only distinct records. */
    distinct?: boolean;

    /** Return only the first matching record instead of an array. */
    firstOnly?: boolean;
}

/**
 * Options for save operations (insert/update).
 * @template T - The record type
 */
export interface SaveOptions<T = any> {
    /** Conditions to identify which record(s) to update. */
    filters?: [string, string, any][] | ((qb: any) => any);
    /** Enable batch mode (reserved for future use). */
    batch?: boolean;
    /** Batch size for bulk operations (reserved for future use). */
    batchSize?: number;
}

/** A minimal query builder interface shared by ddb and transactions. */
type QueryRunner = Kysely<any> | Transaction<any>;

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Apply WHERE conditions to a Kysely query builder.
 * Supports both tuple-array filters and expression-builder callbacks.
 */
function applyFilters<T extends { where: (...args: any[]) => T }>(
    query: T,
    filters: GetListOptions["filters"]
): T {
    if (!filters) return query;

    if (typeof filters === "function") {
        return query.where((eb: any) => filters(eb));
    }

    if (Array.isArray(filters)) {
        for (const [key, operator, value] of filters) {
            // Use dynamic.ref so reserved words / special chars are handled.
            query = query.where(ddb.dynamic.ref(key), operator as any, value);
        }
    }
    return query;
}

/**
 * Return the first value of a possibly-array column from a row.
 */
function pickColumn(row: any, column: string): any {
    if (!row) return null;
    return row[column] ?? null;
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get the total count of records matching the filter conditions.
 *
 * @param tableName - The database table name.
 * @param options   - Query options (only `filters` and `distinct` are used).
 * @returns Total count of matching records.
 */
export async function getListTotal<T = any>(
    tableName: string,
    options: GetListOptions<T> = {}
): Promise<number> {
    const { filters, distinct } = options;

    let countQuery = ddb.selectFrom(tableName as any);

    countQuery = applyFilters(countQuery as any, filters) as any;

    // When `distinct` is requested, count distinct primary keys.
    // We count `id` since every row is expected to have one.
    const countExpr = distinct
        ? ddb.fn.count(ddb.dynamic.ref("id")).distinct().as("count")
        : ddb.fn.countAll().as("count");

    const totalResult = await countQuery.select(countExpr as any).executeTakeFirst();

    const count = (totalResult as any)?.count ?? 0;
    return typeof count === "number" ? count : Number(count);
}

/**
 * Fetch a list of records with filtering, sorting, and pagination support.
 *
 * @param tableName - The database table name.
 * @param options   - Query configuration options.
 * @returns
 *   - If `firstOnly` is true: a single record or `null`.
 *   - If `pagination` is provided: a `PaginatedResult` object.
 *   - Otherwise: an array of records.
 */
export async function getList<T = any>(
    tableName: string,
    options: GetListOptions<T> = {}
): Promise<T[] | PaginatedResult<T> | T | null> {
    const {
        fields,
        filters,
        orderBy,
        pagination,
        distinct = false,
        firstOnly = false,
    } = options;

    if (firstOnly && pagination) {
        throw new Error(
            "getList: `firstOnly` and `pagination` are mutually exclusive."
        );
    }

    let query = ddb.selectFrom(tableName as any);

    // Apply DISTINCT clause if requested.
    if (distinct) {
        query = query.distinct();
    }

    // Select specific columns or all columns.
    if (fields && fields.length > 0) {
        query = query.select(
            fields.map((field) => ddb.dynamic.ref(field as string))
        );
    } else {
        query = query.selectAll();
    }

    // Apply WHERE filters.
    query = applyFilters(query as any, filters) as any;

    // Apply ORDER BY.
    if (orderBy) {
        const orderArray = Array.isArray(orderBy) ? orderBy : [orderBy];
        for (const { column, direction = "asc" } of orderArray) {
            query = query.orderBy(ddb.dynamic.ref(column), direction);
        }
    }

    // Return only the first matching record.
    if (firstOnly) {
        const result = (await query.limit(1).execute()) as T[];
        return result.length > 0 ? result[0] : null;
    }

    // Handle paginated results.
    if (pagination) {
        const { page = 1, limit = 10, offset } = pagination;
        const currentLimit = Math.min(limit, 100); // Safety cap.
        const currentOffset =
            offset !== undefined ? offset : (page - 1) * currentLimit;

        const data = (await query
            .limit(currentLimit)
            .offset(currentOffset)
            .execute()) as T[];

        const total = await getListTotal(tableName, options);
        const totalPages = Math.ceil(total / currentLimit) || 1;

        return {
            data,
            total,
            page,
            limit: currentLimit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        };
    }

    // Execute query without pagination.
    return (await query.execute()) as T[];
}

/**
 * Fetch a single record by its ID or filter conditions.
 *
 * @param tableName - The database table name.
 * @param options   - Query options (filter conditions are recommended).
 * @returns The found record or `null` if not found.
 */
export async function getOne<T = any>(
    tableName: string,
    options: GetListOptions<T> = {}
): Promise<T | null> {
    const result = await getList<T>(tableName, {
        ...options,
        firstOnly: true,
    });
    return result as T | null;
}

// ============================================================================
// Write Operations (standalone — no transaction)
// ============================================================================

/**
 * Insert a single record into the database.
 *
 * @param tableName - The database table name.
 * @param data      - The record data to insert.
 * @returns The ID of the inserted record, or `null` if no ID was returned.
 */
export async function insertOne<T = any>(
    tableName: string,
    data: T
): Promise<number | string | null> {
    try {
        return await insertOneWith(ddb, tableName, data);
    } catch (error) {
        console.error(`Failed to insert into ${tableName}:`, error);
        throw error;
    }
}

/**
 * Update records matching the filter conditions.
 *
 * @param tableName - The database table name.
 * @param data      - The data to update.
 * @param options   - Update options including filter conditions.
 * @returns The ID of the first updated record, or `null` if none were updated.
 */
export async function updateOne<T = any>(
    tableName: string,
    data: T,
    options: SaveOptions<T>
): Promise<number | string | null> {
    try {
        return await updateOneWith(ddb, tableName, data, options);
    } catch (error) {
        console.error(`Failed to update ${tableName}:`, error);
        throw error;
    }
}

/**
 * Perform an upsert operation (insert or update based on existence).
 *
 * Runs inside a transaction so that the update-then-insert sequence
 * is atomic and cannot race with concurrent writers.
 *
 * @param tableName - The database table name.
 * @param data      - The data to insert or update.
 * @param options   - Save options containing filter conditions.
 * @returns The ID of the inserted/updated record, or `null`.
 */
export async function doSave<T = any>(
    tableName: string,
    data: T,
    options: SaveOptions<T>
): Promise<number | string | null> {
    try {
        return await withTransaction(async (trx) => {
            const updated = await updateOneWith(trx, tableName, data, options);
            if (updated !== null) return updated;
            return await insertOneWith(trx, tableName, data);
        });
    } catch (error) {
        console.error(`Failed to save ${tableName}:`, error);
        throw error;
    }
}

// ============================================================================
// Transaction-Aware Internal Implementations
// ============================================================================

/**
 * Insert a single record using the provided query runner (db or transaction).
 * Handles the MySQL `insertId` vs PostgreSQL `RETURNING id` difference.
 */
export async function insertOneWith<T = any>(
    runner: QueryRunner,
    tableName: string,
    data: T
): Promise<number | string | null> {
    if (isMySQL) {
        const result = await runner
            .insertInto(tableName as any)
            .values(data as any)
            .executeTakeFirst();

        const insertId = (result as any)?.insertId;
        return insertId != null ? Number(insertId) : null;
    } else {
        const result = await runner
            .insertInto(tableName as any)
            .values(data as any)
            .returning("id" as any)
            .execute();

        return pickColumn(result[0], "id");
    }
}

/**
 * Update records using the provided query runner (db or transaction).
 *
 * For MySQL, we must SELECT the primary key first because MySQL does not
 * support `UPDATE ... RETURNING`. When this runs inside a transaction the
 * SELECT and UPDATE are atomic relative to other transactions that also
 * use the same row (with a suitable isolation level / row lock).
 */
export async function updateOneWith<T = any>(
    runner: QueryRunner,
    tableName: string,
    data: T,
    options: SaveOptions<T>
): Promise<number | string | null> {
    const { filters } = options;

    let query = runner.updateTable(tableName as any);
    query = applyFilters(query as any, filters) as any;

    if (isMySQL) {
        // 1. Fetch the primary key using the same WHERE conditions.
        let selectQuery = runner
            .selectFrom(tableName as any)
            .select(["id"] as any);
        selectQuery = applyFilters(selectQuery as any, filters) as any;

        const existing = await selectQuery.executeTakeFirst();
        if (!existing) return null;

        // 2. Run the UPDATE.
        await query.set(data as any).execute();

        // 3. Return the primary key.
        return pickColumn(existing, "id");
    } else {
        // PostgreSQL / SQLite support `RETURNING`.
        const result = await query
            .set(data as any)
            .returning("id" as any)
            .execute();

        return result.length > 0 ? pickColumn(result[0], "id") : null;
    }
}

// ============================================================================
// Transaction Support
// ============================================================================

/**
 * Execute a callback inside a database transaction.
 * Automatically rolls back on error and commits on success.
 *
 * @param callback - Receives the transaction object `trx`.
 * @returns The callback's return value.
 *
 * @example
 * ```ts
 * const orderId = await withTransaction(async (trx) => {
 *   const id = await insertOneWith(trx, 'orders', { userId: 1, total: 100 });
 *   await insertOneWith(trx, 'order_items', { orderId: id, sku: 'A1', qty: 2 });
 *   return id;
 * });
 * ```
 */
export async function withTransaction<T>(
    callback: (trx: Transaction<any>) => Promise<T>
): Promise<T> {
    return await ddb.transaction().execute(async (trx) => {
        return await callback(trx);
    });
}

/**
 * Same as {@link withTransaction} but allows specifying the isolation level.
 * Supported values depend on the underlying database engine.
 *
 * @example
 * ```ts
 * await withTransactionIsolated('serializable', async (trx) => {
 *   // ...
 * });
 * ```
 */
export async function withTransactionIsolated<T>(
    isolationLevel: "read committed" | "repeatable read" | "serializable",
    callback: (trx: Transaction<any>) => Promise<T>
): Promise<T> {
    return await ddb
        .transaction()
        .setIsolationLevel(isolationLevel)
        .execute(async (trx) => {
            return await callback(trx);
        });
}

/**
 * Convenience helper: run a save (upsert) inside an explicit transaction.
 * Useful when you want to compose it with other transactional operations.
 */
export async function doSaveInTransaction<T = any>(
    trx: Transaction<any>,
    tableName: string,
    data: T,
    options: SaveOptions<T>
): Promise<number | string | null> {
    const updated = await updateOneWith(trx, tableName, data, options);
    if (updated !== null) return updated;
    return await insertOneWith(trx, tableName, data);
}

// ============================================================================
// Usage Examples (for reference, remove in production)
// ============================================================================
//
// 1) Simple insert
//    const id = await insertOne('users', { name: 'John', email: 'j@x.com' });
//
// 2) Paginated list
//    const page = await getList('users', {
//      filters: [['age', '>=', 18]],
//      orderBy: { column: 'created_at', direction: 'desc' },
//      pagination: { page: 1, limit: 20 },
//    });
//
// 3) Atomic transfer between two accounts
//    await withTransaction(async (trx) => {
//      await trx.updateTable('accounts')
//        .set((eb) => ({ balance: eb('balance', '-', 100) }))
//        .where('id', '=', fromId)
//        .execute();
//      await trx.updateTable('accounts')
//        .set((eb) => ({ balance: eb('balance', '+', 100) }))
//        .where('id', '=', toId)
//        .execute();
//    });
//
// 4) Upsert with explicit transaction composition
//    await withTransaction(async (trx) => {
//      const userId = await doSaveInTransaction(
//        trx,
//        'users',
//        { email: 'j@x.com', name: 'John' },
//        { filters: [['email', '=', 'j@x.com']] }
//      );
//      await insertOneWith(trx, 'audit_log', { userId, action: 'upsert' });
//    });
//
// 5) Serializable isolation
//    await withTransactionIsolated('serializable', async (trx) => {
//      // ...
//    });