export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[#0f1021] px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-[#6c5ce7]/8 blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-[#a29bfe]/6 blur-[100px]" />
      </div>
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
