"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CatIntegration() {
    const [catImage, setCatImage] = useState<string | null>(null);
    const [catFact, setCatFact] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCatData = async () => {
        setLoading(true);
        try {
            // Fetch Image
            const imgRes = await fetch("https://api.thecatapi.com/v1/images/search");
            const imgData = await imgRes.json();
            setCatImage(imgData[0]?.url || null);

            // Fetch Fact
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
        <div className="w-full max-w-4xl mx-auto p-4 mb-8">
            <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold">Daily Cat Dose 🐱</CardTitle>
                    <Button variant="ghost" size="icon" onClick={fetchCatData} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6 items-center">
                    {/* Cat Image */}
                    <div className="relative aspect-video md:aspect-square w-full overflow-hidden rounded-md border bg-muted">
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
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-primary">Did you know?</h3>
                        {loading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-[80%]" />
                                <Skeleton className="h-4 w-[90%]" />
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-lg italic">
                                "{catFact}"
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
