"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Quote } from "lucide-react";
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
        <Card className="overflow-hidden border-none shadow-lg bg-background/60 backdrop-blur-sm">
            <CardContent className="p-0 flex flex-col sm:flex-row h-auto sm:h-32">
                {/* Cat Image - Fixed Square on Left */}
                <div className="relative w-full sm:w-32 h-32 sm:h-full shrink-0 bg-muted">
                    {loading ? (
                        <Skeleton className="h-full w-full" />
                    ) : (
                        catImage && (
                            <img
                                src={catImage}
                                alt="Random Cat"
                                className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                            />
                        )
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-4 flex flex-col justify-center relative group">
                    {/* Refresh Button - Absolute Top Right */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={fetchCatData}
                        disabled={loading}
                    >
                        <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                    </Button>

                    <div className="pr-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                            Daily Wisdom
                        </h3>
                        {loading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        ) : (
                            <p className="text-sm font-medium italic text-foreground/90 leading-relaxed line-clamp-3">
                                "{catFact}"
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
