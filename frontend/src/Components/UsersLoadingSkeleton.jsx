export default function UsersLoadingSkeleton() {
    return (
        <div className="space-y-3 p-2">
            {[1, 2, 3].map((item) => (
                <div
                    key={item}
                    className="flex items-center gap-3 p-3 rounded-lg animate-pulse bg-slate-700/50"
                >
                    <div className="w-12 h-12 bg-slate-600 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}