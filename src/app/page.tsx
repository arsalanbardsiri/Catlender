import { Calendar } from "@/components/calendar";
import { CatIntegration } from "@/components/cat-integration";

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-8 min-h-[calc(100vh-3.5rem)] flex flex-col items-center">
      <div className="w-full max-w-3xl flex flex-col gap-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
        {/* Hero Section: The Cat Banner */}
        <section className="w-full">
          <CatIntegration />
        </section>

        {/* Main Workspace: The Glass Calendar */}
        <section className="w-full flex-1">
          <Calendar />
        </section>
      </div>
    </main>
  );
}
