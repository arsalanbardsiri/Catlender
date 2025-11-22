import { Calendar } from "@/components/calendar";
import { CatIntegration } from "@/components/cat-integration";

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-8 min-h-[calc(100vh-3.5rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* Main Calendar Area (8 cols) */}
        <div className="lg:col-span-8 xl:col-span-9 h-full">
          <Calendar />
        </div>

        {/* Sidebar Area (4 cols) */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
          <CatIntegration />

          {/* Placeholder for future widgets */}
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground bg-muted/10 h-32 flex items-center justify-center">
            More widgets coming soon...
          </div>
        </div>
      </div>
    </main>
  );
}
