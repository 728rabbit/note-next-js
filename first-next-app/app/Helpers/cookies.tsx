// Helpers/cookies.ts
'use server';

import { cookies } from 'next/headers';

export interface CookieOptions {
    httpOnly?: boolean
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
    maxAge?: number
    path?: string
    domain?: string
    expires?: Date
}

const defaultOptions: CookieOptions = {
    httpOnly: true, // Enabled by default to prevent XSS attacks
    secure: process.env.NODE_ENV === 'production', // Force HTTPS in production environment
    sameSite: 'lax', // Lax by default to prevent CSRF attacks
    path: '/', // Readable across the entire website
    maxAge: 60 * 60 * 24 * 7 // Default for 7 days
}

function mergeOptions(userOptions?: CookieOptions): CookieOptions {
    return {
        ...defaultOptions,
        ...userOptions,
        // Special handling for secure: If in production, force to true
        secure: process.env.NODE_ENV === 'production' 
        ? true 
        : (userOptions?.secure ?? defaultOptions.secure)
    }
}

// Server Actions
export async function getCookie(key: string)  {
    try {
        const cookieStore = await cookies();
        return cookieStore.get(key)?.value;
    } catch (error) {
        console.error('Error getting cookie:', error);
        return;
    }
}

export async function setCookie(key: string, value: string, options?: CookieOptions) {
    try {
        const cookieStore = await cookies();
        cookieStore.set(key, value, mergeOptions(options));
    } catch (error) {
        console.error('Error setting cookie:', error);
    }
}

export async function deleteCookie(key: string) {
    try {
        const cookieStore = await cookies();
        cookieStore.delete(key);
    } catch (error) {
        console.error('Error deleting cookie:', error);
    }
}