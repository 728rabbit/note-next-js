import { ddb } from "./kyselydb";

// Get List Data
export interface GetListOptions<T = any> {
    fields?: (keyof T)[] | string[];
    filters?: [string, string, any][] | ((qb: any) => any);
    orderBy?: {
        column: string;
        direction?: 'asc' | 'desc';
    } | Array<{ column: string; direction?: 'asc' | 'desc' }>;
    pagination?: {
        page?: number;
        limit?: number;
        offset?: number;
    };
    distinct?: boolean;
    firstOnly?: boolean;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

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

    // Build the query
    let query = ddb.selectFrom(tableName as any);

    // Handle DISTINCT
    if (distinct) {
        query = query.distinct();
    }

    // Handle SELECT columns
    if (fields && fields.length > 0) {
        query = query.select(fields.map(field => ddb.dynamic.ref(field as string)));
    } else {
        query = query.selectAll();
    }

    // Handle WHERE clause
    if (filters) {
        if (typeof filters === 'function') {
            query = query.where((eb) => {
                return filters(eb);
            });
        } else if (Array.isArray(filters)) {
            // Unified [key, operator, value] format
            filters.forEach(([key, operator, value]) => {
                query = query.where(key, operator as any, value);
            });
        }
    }

    // Handle ORDER BY
    if (orderBy) {
        const orderArray = Array.isArray(orderBy) ? orderBy : [orderBy];
        orderArray.forEach(({ column, direction = 'asc' }) => {
            query = query.orderBy(column, direction);
        });
    }

    // Return only the first record.
    if (firstOnly) {
        const result = await query.limit(1).execute() as T[];
        return result.length > 0 ? result[0] : null;
    }

    // Handle PAGINATION
    if (pagination) {
        const { page = 1, limit = 10, offset } = pagination;
        const currentLimit = Math.min(limit, 100); // Max limit protection
        const currentOffset = offset !== undefined ? offset : (page - 1) * currentLimit;

        // Clone query for count
        let countQuery = ddb.selectFrom(tableName as any);
        
        // Apply same WHERE conditions to count
        if (filters) {
            if (typeof filters === 'function') {
                countQuery = countQuery.where((eb) => {
                    return filters(eb);
                });
            } else if (Array.isArray(filters)) {
                // Unified [key, operator, value] format
                filters.forEach(([key, operator, value]) => {
                    countQuery = countQuery.where(key, operator as any, value);
                });
            }
        }

        // Get total count
        const totalResult = await countQuery
            .select(ddb.fn.countAll().as('count'))
            .execute();
        const total = parseInt((totalResult[0] as any)?.count || '0', 10);

        // Get paginated data
        const data = await query
            .limit(currentLimit)
            .offset(currentOffset)
            .execute() as T[];

        const totalPages = Math.ceil(total / currentLimit);

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

    // Execute query without pagination
    return await query.execute() as T[];
}


