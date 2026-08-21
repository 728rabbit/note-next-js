// app/loading.tsx
// ============================================================
// Loading Component - Full Screen Spinner
// Used by Next.js Suspense boundary during page transitions
// Automatically shows when page.tsx is loading (async data fetch)
// ============================================================

export default function defaultLoading() {
    return (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="text-center">
                {/* Spinner - rotating circle loader */}
                <div className="w-14 h-14 border-6 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
            </div>
        </div>
    );
}
