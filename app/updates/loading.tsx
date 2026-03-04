const UpdatesLoading = () => {
  return (
    <div className="section space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-4 w-72 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-5 space-y-3 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-5 w-40 bg-slate-200 rounded" />
              <div className="h-3 w-24 bg-slate-100 rounded" />
            </div>
            <div className="h-3 w-full bg-slate-100 rounded" />
            <div className="h-3 w-3/4 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpdatesLoading;
