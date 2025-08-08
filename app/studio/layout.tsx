import { Toaster } from "@/components/ui/sonner";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Toaster />
      {children}
    </div>
  );
}
