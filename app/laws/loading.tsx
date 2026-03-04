const LawsLoading = () => {
  return (
    <div className="section space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Title skeleton */}
      <div className="text-center space-y-3">
        <div className="h-8 w-64 bg-slate-200 rounded-lg mx-auto animate-pulse" />
        <div className="h-4 w-96 max-w-full bg-slate-100 rounded mx-auto animate-pulse" />
      </div>

      {/* Featured card skeleton */}
      <div className="border border-slate-200 rounded-lg p-6 space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-32 bg-slate-100 rounded" />
          </div>
          <div className="h-12 w-16 bg-green-100 rounded" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-40 bg-green-100 rounded-lg" />
          <div className="h-10 w-32 bg-slate-100 rounded-lg" />
        </div>
      </div>

      {/* Cards grid skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-5 space-y-3 animate-pulse">
            <div className="h-5 w-2/3 bg-slate-200 rounded" />
            <div className="h-3 w-full bg-slate-100 rounded" />
            <div className="h-3 w-4/5 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LawsLoading;
