
"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { analyzeSchedule, suggestReschedule } from "@/app/actions/gemini";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Cat, CalendarClock, ArrowRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

interface RescheduleSuggestion {
    taskId: string;
    taskText: string;
    currentDate: string;
    newDate: string;
    reason: string;
}

export function CatConcierge() {
    const { tasks, moveTask } = useTasks();
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Reschedule State
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<RescheduleSuggestion[]>([]);
    const [rescheduleLoading, setRescheduleLoading] = useState(false);

    const getContext = async () => {
        const now = new Date();
        const dateStr = format(now, "EEEE, MMMM do");
        let weatherStr = "Unknown";

        try {
            if (navigator.geolocation) {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                });
                const res = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&current=weather_code`
                );
                const data = await res.json();
                const code = data.current.weather_code;

                if (code <= 3) weatherStr = "Clear/Cloudy";
                else if (code < 50) weatherStr = "Foggy";
                else if (code < 80) weatherStr = "Rainy";
                else weatherStr = "Stormy/Snowy";
            }
        } catch (e) {
            console.log("Could not fetch weather", e);
        }
        return { dateStr, weatherStr, now };
    };

    const handleAnalyze = async () => {
        setLoading(true);
        const { dateStr, weatherStr, now } = await getContext();

        // Filter Tasks for Today and Next 7 Days
        const todayTasks = tasks[format(now, "yyyy-MM-dd")] || [];

        let weeklyTasksStr = "";
        for (let i = 1; i <= 7; i++) {
            const date = addDays(now, i);
            const dateKey = format(date, "yyyy-MM-dd");
            const dayTasks = tasks[dateKey];
            if (dayTasks && dayTasks.length > 0) {
                weeklyTasksStr += `\n${format(date, "EEEE")}: ${dayTasks.map(t => t.text).join(", ")}`;
            }
        }

        const taskContext = `
        Today's Tasks:
        ${todayTasks.length > 0 ? todayTasks.map(t => `- ${t.text} (${t.completed ? 'Done' : 'Pending'})`).join("\n") : "No tasks for today."}

        Upcoming Week:
        ${weeklyTasksStr || "No upcoming tasks for the next 7 days."}
        `;

        const result = await analyzeSchedule(taskContext, dateStr, weatherStr);
        setAnalysis(result);
        setLoading(false);
    };

    const handleRescheduleRequest = async () => {
        setRescheduleLoading(true);
        const { dateStr, weatherStr, now } = await getContext();

        // Flatten tasks for AI
        const allTasks = Object.entries(tasks).flatMap(([date, dayTasks]) =>
            dayTasks.map(t => ({ ...t, date }))
        );

        const result = await suggestReschedule(allTasks, dateStr, weatherStr);

        if (result && result.suggestions && result.suggestions.length > 0) {
            setSuggestions(result.suggestions);
            setIsRescheduleOpen(true);
        } else {
            // Show a toast or small message that no changes are needed (omitted for brevity)
            alert("The Cat Concierge thinks your schedule is purr-fect! No changes needed.");
        }
        setRescheduleLoading(false);
    };

    const confirmReschedule = async () => {
        for (const s of suggestions) {
            await moveTask(s.taskId, s.currentDate, s.newDate);
        }
        setIsRescheduleOpen(false);
        setSuggestions([]);
        // Refresh analysis after moving
        handleAnalyze();
    };

    // Helper to parse the structured response
    const parseAnalysis = (text: string) => {
        const sections = text.split("**").filter(s => s.trim().length > 0);
        const parsed: Record<string, string> = {};

        for (let i = 0; i < sections.length; i += 2) {
            const key = sections[i].replace(":", "").trim();
            const value = sections[i + 1]?.trim();
            if (key && value) parsed[key] = value;
        }
        return parsed;
    };

    const parsedAnalysis = analysis ? parseAnalysis(analysis) : null;

    return (
        <>
            <Card className="w-full border-none shadow-sm bg-primary/5 backdrop-blur-sm overflow-hidden transition-all duration-500">
                <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-full">
                                <Cat className="h-4 w-4 text-primary" id="cat" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground" id="cat">Cat Concierge</h3>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs gap-1.5 hover:bg-destructive/10 hover:text-destructive text-foreground/70"
                                onClick={handleRescheduleRequest}
                                disabled={rescheduleLoading || loading}
                                aria-label="Reschedule tasks"
                            >
                                <CalendarClock className={cn("h-3.5 w-3.5", rescheduleLoading && "animate-spin")} />
                                {rescheduleLoading ? "Checking..." : "Reschedule"}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs gap-1.5 hover:bg-primary/10 hover:text-primary text-foreground/70"
                                onClick={handleAnalyze}
                                disabled={loading || rescheduleLoading}
                                aria-label="Analyze schedule with AI"
                            >
                                <Sparkles className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                                {loading ? "Thinking..." : "Analyze"}
                            </Button>
                        </div>
                    </div>

                    {parsedAnalysis ? (
                        <div className="bg-background/80 p-4 rounded-lg border border-border/50 animate-in fade-in slide-in-from-top-2 shadow-sm space-y-3">
                            {parsedAnalysis["Headline"] && (
                                <p className="text-sm font-medium text-primary italic">
                                    "{parsedAnalysis["Headline"]}"
                                </p>
                            )}
                            <div className="space-y-2">
                                {parsedAnalysis["Today's Focus"] && (
                                    <div>
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Today</span>
                                        <p className="text-sm text-foreground/90">{parsedAnalysis["Today's Focus"]}</p>
                                    </div>
                                )}
                                {parsedAnalysis["Weekly Outlook"] && (
                                    <div>
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">This Week</span>
                                        <p className="text-sm text-foreground/90">{parsedAnalysis["Weekly Outlook"]}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : analysis && (
                        <div className="bg-background/80 p-3 rounded-lg border border-border/50 animate-in fade-in slide-in-from-top-2 shadow-sm">
                            <p className="text-sm text-foreground italic leading-relaxed">
                                "{analysis}"
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
                <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-background/95 backdrop-blur-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Cat className="h-5 w-5 text-primary" />
                            Suggested Changes
                        </DialogTitle>
                        <DialogDescription>
                            I found some tasks that might be better suited for another day. What do you think?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-3">
                        {suggestions.map((s) => (
                            <div key={s.taskId} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium text-sm">{s.taskText}</span>
                                    <span className="text-xs text-muted-foreground italic">"{s.reason}"</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium">
                                    <span className="text-muted-foreground line-through">{s.currentDate}</span>
                                    <ArrowRight className="h-3 w-3 text-primary" />
                                    <span className="text-primary">{s.newDate}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsRescheduleOpen(false)}>
                            <X className="h-4 w-4 mr-2" />
                            No, keep them
                        </Button>
                        <Button onClick={confirmReschedule}>
                            <Check className="h-4 w-4 mr-2" />
                            Approve Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

