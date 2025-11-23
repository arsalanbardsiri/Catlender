"use client";

import { useState, useEffect } from "react";
import { fetchWeather, searchCity, WeatherData } from "@/lib/weather";
import { Cloud, CloudRain, CloudSnow, CloudLightning, Sun, Moon, Loader2, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function WeatherForecast() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [manualLocation, setManualLocation] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [locationName, setLocationName] = useState<string | null>(null);

    const handleLocationError = () => {
        setError("Location access denied");
        setLoading(false);
    };

    const fetchWeatherByCoords = async (lat: number, lon: number, name?: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchWeather(lat, lon);
            setWeather(data);
            if (name) setLocationName(name);
        } catch (err) {
            setError("Failed to fetch weather");
        } finally {
            setLoading(false);
        }
    };

    const handleManualSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualLocation.trim()) return;

        setIsSearching(true);
        setError(null);

        const result = await searchCity(manualLocation);

        if (result) {
            await fetchWeatherByCoords(result.lat, result.lon, result.name);
        } else {
            setError("City not found");
            setLoading(false);
        }
        setIsSearching(false);
    };

    const requestLocation = () => {
        setLoading(true);
        if (!navigator.geolocation) {
            setError("Geolocation not supported");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            handleLocationError
        );
    };

    useEffect(() => {
        // Try to get location on mount, but don't block UI if denied
        requestLocation();
    }, []);

    const getWeatherIcon = (code: number, isDay: boolean = true, size: string = "h-6 w-6") => {
        const props = { className: size };
        if (code === 0 || code === 1) return isDay ? <Sun {...props} className={cn(size, "text-amber-400 animate-pulse")} /> : <Moon {...props} className={cn(size, "text-blue-300")} />;
        if (code >= 95) return <CloudLightning {...props} className={cn(size, "text-purple-500 animate-pulse")} />;
        if (code >= 71) return <CloudSnow {...props} className={cn(size, "text-blue-200")} />;
        if (code >= 51) return <CloudRain {...props} className={cn(size, "text-blue-400")} />;
        return <Cloud {...props} className={cn(size, "text-gray-400")} />;
    };

    if (loading) {
        return (
            <div className="w-full h-48 flex items-center justify-center bg-background/40 backdrop-blur-md rounded-xl border border-white/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
        )
    }

    if (error || !weather) {
        return (
            <Card className="w-full border-none shadow-lg bg-background/40 backdrop-blur-xl overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <MapPin className="h-8 w-8 opacity-50" />
                        <p className="text-sm font-medium">{error || "Setup Weather"}</p>
                        <p className="text-xs opacity-70">Enable location or search for your city.</p>
                    </div>

                    <div className="w-full max-w-xs space-y-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2 bg-white/5 border-white/10 hover:bg-white/10"
                            onClick={requestLocation}
                        >
                            <MapPin className="h-3 w-3" />
                            Use Current Location
                        </Button>

                        <div className="relative flex items-center">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-2 text-[10px] text-muted-foreground uppercase">Or</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>

                        <form onSubmit={handleManualSearch} className="flex gap-2">
                            <Input
                                placeholder="Enter city name..."
                                className="h-8 text-xs bg-white/5 border-white/10"
                                value={manualLocation}
                                onChange={(e) => setManualLocation(e.target.value)}
                            />
                            <Button type="submit" size="sm" className="h-8 w-8 p-0" disabled={isSearching}>
                                {isSearching ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full border-none shadow-xl bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-xl overflow-hidden ring-1 ring-white/10">
            <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                    {/* Current Weather Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/5 rounded-2xl ring-1 ring-primary/10 shadow-inner">
                                {getWeatherIcon(weather.current.weatherCode, weather.current.isDay, "h-10 w-10")}
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-4xl font-bold tracking-tighter bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                                    {Math.round(weather.current.temperature)}°
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-muted-foreground capitalize">
                                        {weather.current.description}
                                    </span>
                                    {locationName && (
                                        <span className="text-xs text-muted-foreground/60 flex items-center gap-0.5">
                                            <MapPin className="h-3 w-3" /> {locationName}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Weather Details */}
                        <div className="flex gap-4 text-xs font-medium text-muted-foreground/80">
                            <div className="flex flex-col items-center gap-1 bg-background/50 p-2 rounded-lg border border-white/5">
                                <span className="uppercase tracking-wider text-[10px]">Wind</span>
                                <span>{Math.round(weather.current.windSpeed)} mph</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 bg-background/50 p-2 rounded-lg border border-white/5">
                                <span className="uppercase tracking-wider text-[10px]">Humidity</span>
                                <span>{Math.round(weather.current.humidity)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Forecast Divider */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-border/50 to-transparent" />

                    {/* Forecast Days */}
                    <div className="grid grid-cols-5 gap-2">
                        {weather.daily.slice(1, 6).map((day, i) => (
                            <div
                                key={day.date}
                                className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-primary/5 transition-all duration-300 group cursor-default"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                    {format(new Date(day.date), "EEE")}
                                </span>
                                <div className="transform group-hover:scale-110 transition-transform duration-300">
                                    {getWeatherIcon(day.weatherCode, true, "h-5 w-5")}
                                </div>
                                <div className="flex flex-col items-center text-xs">
                                    <span className="font-bold text-foreground/90">{Math.round(day.maxTemp)}°</span>
                                    <span className="text-muted-foreground/60">{Math.round(day.minTemp)}°</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
