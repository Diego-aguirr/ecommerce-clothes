export const Modal = () => {
  return (
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center">
      <div className="bg-card p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-foreground">Modal Title</h2>
        <p className="mt-4 text-foreground">Modal Content</p>
      </div>
    </div>
  );
};
