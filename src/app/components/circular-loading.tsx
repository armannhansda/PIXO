export default function CircularLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-muted-foreground/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
