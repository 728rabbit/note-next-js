// app/error.tsx
// ============================================================
// Error Component - Full Screen Error Boundary UI
// Automatically rendered by Next.js when a page throws an error
// Must be a Client Component (uses 'use client')
// Props: error - the error object, reset - function to retry
// ============================================================
'use client';

import {useEffect} from 'react';

export default function defaultError({error, reset} : {
    error : Error & {
        digest?: string
    };
    reset : () => void;
}) {
    // Log error to console (can be replaced with Sentry or similar)
    useEffect(() => {
        console.error('Error:', error);
    }, [error]);

    return (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center text-center max-w-md px-6"> 
                { /* Animated icon with pulsing background ring */}
                <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-full bg-linear-to-tr from-blue-400/20 to-purple-400/20 animate-pulse"/>
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">⚡</div>
                </div>

                {/* Error message - bilingual for client */}
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    系統異常，請稍後再試。<br/>
                    System error, please try again later.
                </h1>
                
                {/* Show detailed error only in development for debugging */}
                { 
                    process.env.NODE_ENV === 'development' && 
                    (
                    <div className="mt-4 w-full p-3 text-red-500 text-center border-2 border-red-100 rounded-lg">{error.message}</div>
                    )
                }       

                {/* Retry button - calls reset() to re-render the page */}
                <div className="mt-8 flex gap-3">
                    <button onClick={reset}
                        className="px-6 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all duration-200 font-medium text-sm shadow-lg shadow-slate-800/20 hover:shadow-slate-800/30 active:scale-95 cursor-pointer">
                        重新載入 Reload
                    </button>
                </div>
            </div>
        </div>);
}
