"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/calendar";
import { CatIntegration } from "@/components/cat-integration";
import { CatConcierge } from "@/components/cat-concierge";
import { AuthForm } from "@/components/auth-form";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <AuthForm />;
  }

  return (
    <main className="container mx-auto p-4 min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center">
      <div className="w-full max-w-md flex flex-col gap-4 animate-in fade-in duration-700 slide-in-from-bottom-4">
        {/* Hero Section: The Cat Banner */}
        <section className="w-full">
          <CatIntegration />
        </section>

        {/* AI Section: The Concierge */}
        <section className="w-full">
          <CatConcierge />
        </section>

        {/* Main Workspace: The Glass Calendar */}
        <section className="w-full flex-1">
          <Calendar />
        </section>
      </div>
    </main>
  );
}
