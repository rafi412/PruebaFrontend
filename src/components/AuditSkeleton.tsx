export function AuditSkeleton() {
  return (
    <div className="animate-pulse flex items-center justify-between p-4 border-b border-gray-100">
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-3 bg-gray-100 rounded w-1/4"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
    </div>
  );
}