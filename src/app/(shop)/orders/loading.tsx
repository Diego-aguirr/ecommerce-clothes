export default function Loading() {
  return (
    <div className="flex justify-center items-center h-[500px]">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground font-medium animate-pulse">Cargando...</p>
      </div>
    </div>
  );
}
