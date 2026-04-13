const StayNotFound = () => {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-8">
      <div className="max-w-sm text-center">
        <p className="mb-6 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          xenia
        </p>
        <h1 className="mb-3 text-2xl font-medium">
          This page is no longer available
        </h1>
        <p className="text-sm text-muted-foreground">
          The link may have expired or is incorrect. Contact your host directly.
        </p>
      </div>
    </div>
  );
};

export default StayNotFound;
