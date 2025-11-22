"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <Card className="overflow-hidden h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    Daily Inspiration
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={fetchCatData}
                    disabled={loading}
                >
                    <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                {/* Cat Image */}
                <div className="relative aspect-square w-full overflow-hidden rounded-md border bg-muted">
                    {loading ? (
                        <Skeleton className="h-full w-full" />
                    ) : (
                        catImage && (
                            <img
                                src={catImage}
                                alt="Random Cat"
                                className="h-full w-full object-cover transition-all hover:scale-105"
                            />
                        )
                    )}
                </div>

                {/* Cat Fact */}
                <div className="flex-1 flex flex-col justify-center">
                    {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-[90%]" />
                        </div>
                    ) : (
                        <blockquote className="relative border-l-2 pl-4 italic text-muted-foreground text-sm">
                            <Quote className="h-3 w-3 absolute -top-2 -left-1 text-muted-foreground/20" />
                            "{catFact}"
                        </blockquote>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
