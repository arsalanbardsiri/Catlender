"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { analyzeSchedule } from "@/app/actions/gemini";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export function CatConcierge() {
    const { tasks } = useTasks();
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);

        // Flatten tasks from the map into a single array
        const allTasks = Object.values(tasks).flat();

        const result = await analyzeSchedule(allTasks);
        setAnalysis(result);
        setLoading(false);
    };

    return (
        <Card className="w-full border-none shadow-sm bg-primary/5 backdrop-blur-sm overflow-hidden transition-all duration-500">
            <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-full">
                            <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground/80">Cat Concierge</h3>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs gap-1.5 hover:bg-primary/10 hover:text-primary"
                        onClick={handleAnalyze}
                        disabled={loading}
                    >
                        <Sparkles className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                        {loading ? "Thinking..." : "Analyze Schedule"}
                    </Button>
                </div>

                {analysis && (
                    <div className="bg-background/50 p-3 rounded-lg border border-border/50 animate-in fade-in slide-in-from-top-2">
                        <p className="text-sm text-muted-foreground italic leading-relaxed">
                            "{analysis}"
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
