import { Calendar } from "@/components/calendar";
import { CatIntegration } from "@/components/cat-integration";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <CatIntegration />
      <Calendar />
    </main>
  );
}
