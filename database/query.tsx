import { ddb } from "./kyselydb";

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
     * or a Kysely expression builder function
     */
    filters?: [string, string, any][] | ((qb: any) => any);
    
    /** Sorting configuration - single or multiple columns */
    orderBy?: {
        column: string;
        direction?: 'asc' | 'desc';
    } | Array<{ column: string; direction?: 'asc' | 'desc' }>;
    
    /** Pagination settings */
    pagination?: {
        page?: number;
        limit?: number;
        offset?: number;
    };
    
    /** Return only distinct records */
    distinct?: boolean;
    
    /** Return only the first matching record instead of an array */
    firstOnly?: boolean;
}

/**
 * Paginated response structure
 * @template T - The record type
 */
export interface PaginatedResult<T> {
    /** Array of records for the current page */
    data: T[];
    /** Total number of records matching the query */
    total: number;
    /** Current page number (1-indexed) */
    page: number;
    /** Number of records per page */
    limit: number;
    /** Total number of pages available */
    totalPages: number;
    /** Whether there is a next page */
    hasNext: boolean;
    /** Whether there is a previous page */
    hasPrev: boolean;
}

/**
 * Options for save operations (insert/update)
 * @template T - The record type
 */
export interface SaveOptions<T = any> {
    /** Conditions to identify which record(s) to update */
    filters?: [string, string, any][] | ((qb: any) => any);
    /** Enable batch mode (reserved for future use) */
    batch?: boolean;
    /** Batch size for bulk operations (reserved for future use) */
    batchSize?: number;
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get the total count of records matching the filter conditions
 * 
 * @param tableName - The database table name
 * @param options - Query options (only `filters` is used)
 * @returns Total count of matching records
 * 
 * @example
 * ```ts
 * const total = await getListTotal('users', {
 *   filters: [['status', '=', 'active']]
 * });
 * ```
 */
export async function getListTotal<T = any>(
    tableName: string,
    options: GetListOptions<T> = {}
): Promise<number> {
    const { filters } = options;

    let countQuery = ddb.selectFrom(tableName as any);
    
    // Apply the same WHERE conditions to the count query
    if (filters) {
        if (typeof filters === 'function') {
            countQuery = countQuery.where((eb) => filters(eb));
        } else if (Array.isArray(filters)) {
            filters.forEach(([key, operator, value]) => {
                countQuery = countQuery.where(key, operator as any, value);
            });
        }
    }

    const totalResult = await countQuery
        .select(ddb.fn.countAll().as('count'))
        .executeTakeFirst();
    
    const count = totalResult?.count ?? 0;
    return typeof count === 'number' ? count : Number(count);
}

/**
 * Fetch a list of records with filtering, sorting, and pagination support
 * 
 * @param tableName - The database table name
 * @param options - Query configuration options
 * @returns 
 *   - If `firstOnly` is true: returns a single record or `null`
 *   - If `pagination` is provided: returns a `PaginatedResult` object
 *   - Otherwise: returns an array of records
 * 
 * @example
 * ```ts
 * // Get paginated results
 * const result = await getList('users', {
 *   filters: [['age', '>=', 18]],
 *   orderBy: { column: 'created_at', direction: 'desc' },
 *   pagination: { page: 1, limit: 20 }
 * });
 * 
 * // Get a single record
 * const user = await getList('users', {
 *   filters: [['email', '=', 'test@example.com']],
 *   firstOnly: true
 * });
 * ```
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
        firstOnly = false
    } = options;

    let query = ddb.selectFrom(tableName as any);

    // Apply DISTINCT clause if requested
    if (distinct) {
        query = query.distinct();
    }

    // Select specific columns or all columns
    if (fields && fields.length > 0) {
        query = query.select(fields.map(field => ddb.dynamic.ref(field as string)));
    } else {
        query = query.selectAll();
    }

    // Apply WHERE filters
    if (filters) {
        if (typeof filters === 'function') {
            query = query.where((eb) => filters(eb));
        } else if (Array.isArray(filters)) {
            filters.forEach(([key, operator, value]) => {
                query = query.where(key, operator as any, value);
            });
        }
    }

    // Apply ORDER BY
    if (orderBy) {
        const orderArray = Array.isArray(orderBy) ? orderBy : [orderBy];
        orderArray.forEach(({ column, direction = 'asc' }) => {
            query = query.orderBy(column, direction);
        });
    }

    // Return only the first matching record
    if (firstOnly) {
        const result = await query.limit(1).execute() as T[];
        return result.length > 0 ? result[0] : null;
    }

    // Handle paginated results
    if (pagination) {
        const { page = 1, limit = 10, offset } = pagination;
        const currentLimit = Math.min(limit, 100); // Safety cap to prevent excessive queries
        const currentOffset = offset !== undefined ? offset : (page - 1) * currentLimit;

        const data = await query
            .limit(currentLimit)
            .offset(currentOffset)
            .execute() as T[];

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

    // Execute query without pagination (returns all matching records)
    return await query.execute() as T[];
}

/**
 * Fetch a single record by its ID or filter conditions
 * 
 * @param tableName - The database table name
 * @param options - Query options (filter conditions are recommended)
 * @returns The found record or `null` if not found
 * 
 * @example
 * ```ts
 * const user = await getOne('users', {
 *   filters: [['id', '=', '123']]
 * });
 * ```
 */
export async function getOne<T = any>(
    tableName: string,
    options: GetListOptions<T> = {}
): Promise<T | null> {
    const result = await getList<T>(tableName, {
        ...options,
        firstOnly: true
    });
    return result as T | null;
}

// ============================================================================
// Write Operations
// ============================================================================

/**
 * Insert a single record into the database
 * 
 * @param tableName - The database table name
 * @param data - The record data to insert
 * @returns The ID of the inserted record, or `null` if no ID was returned
 * 
 * @throws Will throw an error if the insert operation fails
 * 
 * @example
 * ```ts
 * const id = await insertOne('users', {
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * });
 * ```
 */
export async function insertOne<T = any>(
    tableName: string,
    data: T
): Promise<number | string | null> {
    try {
        const result = await ddb
            .insertInto(tableName as any)
            .values(data as any)
            .returning('id')
            .execute();

        return result[0]?.id ?? null;
    } catch (error) {
        console.error(`Failed to insert into ${tableName}:`, error);
        throw error;
    }
}

/**
 * Update records matching the filter conditions
 * 
 * @param tableName - The database table name
 * @param data - The data to update
 * @param options - Update options including filter conditions
 * @returns The ID of the first updated record, or `null` if no records were updated
 * 
 * @throws Will throw an error if the update operation fails
 * 
 * @example
 * ```ts
 * const id = await updateOne('users', 
 *   { status: 'inactive' },
 *   { filters: [['last_login', '<', '2024-01-01']] }
 * );
 * ```
 */
export async function updateOne<T = any>(
    tableName: string,
    data: T,
    options: SaveOptions<T>
): Promise<number | string | null> {
    const { filters } = options;

    try {
        let query = ddb.updateTable(tableName as any);

        // Apply WHERE conditions
        if (filters) {
            if (typeof filters === 'function') {
                query = query.where((eb) => filters(eb));
            } else if (Array.isArray(filters)) {
                filters.forEach(([key, operator, value]) => {
                    query = query.where(key, operator as any, value);
                });
            }
        }
        
        const result = await query
            .set(data as any)
            .returning('id')
            .execute();

        return result.length > 0 ? result[0].id : null;
    } catch (error) {
        console.error(`Failed to update ${tableName}:`, error);
        throw error;
    }
}


/**
 * Perform an upsert operation (insert or update based on existence)
 * 
 * Attempts to update first, then falls back to insert if no records exist.
 * If a duplicate key error occurs during insert, the operation is complete
 * (the record was already inserted by another request).
 * 
 * @param tableName - The database table name
 * @param data - The data to insert or update
 * @param options - Save options containing filter conditions
 * @returns The ID of the inserted/updated record, or `null` if no ID was returned
 * 
 * @throws Will throw an error if the database operation fails
 * 
 * @example
 * ```ts
 * const id = await doSave('users', 
 *   { email: 'john@example.com', name: 'John Updated' },
 *   { filters: [['email', '=', 'john@example.com']] }
 * );
 * ```
 */
export async function doSave<T = any>(
    tableName: string,
    data: T,
    options: SaveOptions<T>
): Promise<number | string | null> {
    try {
        // Try to update existing records
        const updateResult = await updateOne(tableName, data, options);
        
        // If update affected at least one record, return the ID
        if (updateResult !== null) {
            return updateResult;
        }
        
        // No records were updated, so insert a new record
        return await insertOne(tableName, data);
    } catch (error) {
        console.error(`Failed to save ${tableName}:`, error);
        throw error;
    }
}