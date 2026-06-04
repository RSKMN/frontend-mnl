"use client";

interface ChartSkeletonProps {
  type?: "chart" | "table" | "matrix" | "3d" | "dashboard";
  titleWidthClass?: string;
  className?: string;
}

export default function ChartSkeleton({
  type = "chart",
  titleWidthClass = "w-40",
  className = "",
}: ChartSkeletonProps) {
  const renderContent = () => {
    switch (type) {
      case "table":
        return (
          <div className="space-y-4 flex-1">
            <div className="h-8 w-full rounded-md bg-slate-200 animate-pulse dark:bg-slate-800" />
            <div className="h-8 w-full rounded-md bg-slate-200 animate-pulse dark:bg-slate-800" />
            <div className="h-8 w-full rounded-md bg-slate-200 animate-pulse dark:bg-slate-800" />
            <div className="h-8 w-full rounded-md bg-slate-200 animate-pulse dark:bg-slate-800" />
            <div className="h-8 w-full rounded-md bg-slate-200 animate-pulse dark:bg-slate-800" />
          </div>
        );
      case "matrix":
        return (
          <div className="grid grid-cols-5 gap-1 flex-1">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-sm bg-slate-200 animate-pulse dark:bg-slate-800" />
            ))}
          </div>
        );
      case "3d":
        return (
          <div className="flex-1 w-full h-96 rounded-lg bg-slate-200 animate-pulse dark:bg-slate-800 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full border-4 border-slate-300 dark:border-slate-700 animate-pulse" />
          </div>
        );
      case "dashboard":
        return (
          <div className="grid grid-cols-3 gap-4 flex-1 w-full h-full">
             <div className="col-span-1 h-32 rounded-lg bg-slate-200 animate-pulse dark:bg-slate-800" />
             <div className="col-span-1 h-32 rounded-lg bg-slate-200 animate-pulse dark:bg-slate-800" />
             <div className="col-span-1 h-32 rounded-lg bg-slate-200 animate-pulse dark:bg-slate-800" />
             <div className="col-span-2 h-64 rounded-lg bg-slate-200 animate-pulse dark:bg-slate-800" />
             <div className="col-span-1 h-64 rounded-lg bg-slate-200 animate-pulse dark:bg-slate-800" />
          </div>
        );
      case "chart":
      default:
        return (
          <div className="relative h-64 flex-1 rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-[#1e293b] dark:bg-[#020617]">
            <div className="absolute bottom-6 left-4 right-4 flex items-end gap-2">
              <div className="h-16 flex-1 rounded-sm bg-slate-200 animate-pulse dark:bg-slate-800" />
              <div className="h-24 flex-1 rounded-sm bg-slate-200 animate-pulse dark:bg-slate-800" />
              <div className="h-12 flex-1 rounded-sm bg-slate-200 animate-pulse dark:bg-slate-800" />
              <div className="h-28 flex-1 rounded-sm bg-slate-200 animate-pulse dark:bg-slate-800" />
              <div className="h-20 flex-1 rounded-sm bg-slate-200 animate-pulse dark:bg-slate-800" />
              <div className="h-32 flex-1 rounded-sm bg-slate-200 animate-pulse dark:bg-slate-800" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-lg dark:border-[#1e293b] dark:bg-[#0b0f19] ${className}`}>
      <div className={`mb-6 h-4 rounded-md bg-slate-200 animate-pulse dark:bg-slate-800 ${titleWidthClass}`} />
      {renderContent()}
    </div>
  );
}
