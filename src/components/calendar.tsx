"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    generateCalendarGrid,
    getMonthTitle,
    getNextMonth,
    getPrevMonth,
} from "@/lib/calendar-logic";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Calendar() {
    // STATE MANAGEMENT
    // We need to keep track of which month the user is currently looking at.
    // useState is the "memory" of our component.
    const [currentDate, setCurrentDate] = useState(new Date());

    // Generate the grid for the current month
    const days = generateCalendarGrid(currentDate);

    // Handlers for navigation
    const handlePrevMonth = () => setCurrentDate(getPrevMonth(currentDate));
    const handleNextMonth = () => setCurrentDate(getNextMonth(currentDate));

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            {/* Header: Month Title and Navigation */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">{getMonthTitle(currentDate)}</h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2 text-center font-semibold text-muted-foreground">
                {weekDays.map((day) => (
                    <div key={day}>{day}</div>
                ))}
            </div>

            {/* The Grid (The Matrix) */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => (
                    <div
                        key={index}
                        className={cn(
                            "min-h-[100px] p-2 border rounded-lg transition-colors hover:bg-accent/50 cursor-pointer flex flex-col justify-between",
                            !day.isCurrentMonth && "opacity-50 bg-muted/30",
                            day.isToday && "border-primary border-2"
                        )}
                    >
                        <div className="text-right text-sm font-medium">
                            {day.date.getDate()}
                        </div>
                        {/* We will put tasks here later */}
                    </div>
                ))}
            </div>
        </div>
    );
}
