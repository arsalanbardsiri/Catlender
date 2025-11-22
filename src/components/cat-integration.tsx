"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CatIntegration() {
    const [catImage, setCatImage] = useState<string | null>(null);
    const [catFact, setCatFact] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCatData = async () => {
        setLoading(true);
        try {
            const imgRes = await fetch("https://api.thecatapi.com/v1/images/search");
            const imgData = await imgRes.json();
            setCatImage(imgData[0]?.url || null);

            const factRes = await fetch("https://meowfacts.herokuapp.com/");
            const factData = await factRes.json();
            setCatFact(factData.data[0] || "Cats are awesome!");
        } catch (error) {
            console.error("Failed to fetch cat data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCatData();
    }, []);

    return (
        <Card className="overflow-hidden border-none shadow-sm bg-background/40 backdrop-blur-sm">
            <CardContent className="p-3 flex items-center gap-4">
                {/* Cat Image - Tiny Avatar */}
                <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden bg-muted ring-2 ring-border/50">
                    {loading ? (
                        <Skeleton className="h-full w-full" />
                    ) : (
                        catImage && (
                            <img
                                src={catImage}
                                alt="Random Cat"
                                className="h-full w-full object-cover"
                            />
                        )
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Daily Wisdom
                        </h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-muted-foreground hover:text-foreground"
                            onClick={fetchCatData}
                            disabled={loading}
                        >
                            <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                        </Button>
                    </div>

                    {loading ? (
                        <Skeleton className="h-3 w-3/4 mt-1" />
                    ) : (
                        <p className="text-xs font-medium text-foreground/80 truncate" title={catFact || ""}>
                            "{catFact}"
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
