"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { format } from "date-fns";
import {
    generateCalendarGrid,
    getMonthTitle,
    getNextMonth,
    getPrevMonth,
} from "@/lib/calendar-logic";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { tasks, addTask, deleteTask, toggleTask } = useTasks();

    // State for the "Add Task" dialog
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [newTaskText, setNewTaskText] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const days = generateCalendarGrid(currentDate);

    const handlePrevMonth = () => setCurrentDate(getPrevMonth(currentDate));
    const handleNextMonth = () => setCurrentDate(getNextMonth(currentDate));

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        setIsDialogOpen(true);
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedDate && newTaskText.trim()) {
            const dateKey = format(selectedDate, "yyyy-MM-dd");
            addTask(dateKey, newTaskText);
            setNewTaskText("");
            // We keep the dialog open so they can add more, or we could close it.
            // Let's keep it open but clear the input.
        }
    };

    // Helper to get tasks for a specific day (O(1) lookup!)
    const getTasksForDay = (date: Date) => {
        const dateKey = format(date, "yyyy-MM-dd");
        return tasks[dateKey] || [];
    };

    return (
        <Card className="w-full shadow-2xl border-none bg-gradient-to-br from-background/60 to-background/30 backdrop-blur-2xl ring-1 ring-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
                <CardTitle className="text-3xl font-light tracking-tight text-foreground/80">
                    {getMonthTitle(currentDate)}
                </CardTitle>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background/50" onClick={handlePrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background/50" onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 mb-4 text-center">
                    {weekDays.map((day) => (
                        <div key={day} className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                            {day}
                        </div>
                    ))}
                </div>

                {/* The Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {days.map((day, index) => {
                        const dayTasks = getTasksForDay(day.date);
                        const isSelected = selectedDate && format(day.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");

                        return (
                            <div
                                key={index}
                                onClick={() => handleDayClick(day.date)}
                                className={cn(
                                    "aspect-square p-2 rounded-xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-between relative group hover:shadow-lg hover:-translate-y-0.5 border border-transparent",
                                    !day.isCurrentMonth && "opacity-30 hover:opacity-60",
                                    day.isToday && "bg-primary/20 text-primary font-bold ring-1 ring-primary/30",
                                    isSelected && "bg-primary text-primary-foreground shadow-primary/20 shadow-xl scale-105 z-10",
                                    !day.isToday && !isSelected && "hover:bg-white/5 hover:border-white/10"
                                )}
                            >
                                <div className="text-sm font-medium mb-1">{day.date.getDate()}</div>

                                {/* Task Text Previews */}
                                <div className="flex flex-col gap-1 w-full px-0.5 flex-1 overflow-hidden">
                                    {dayTasks.slice(0, 3).map((task) => (
                                        <div
                                            key={task.id}
                                            className={cn(
                                                "text-[10px] sm:text-xs px-1.5 py-0.5 rounded-sm truncate font-medium transition-all",
                                                task.completed
                                                    ? "bg-emerald-500/10 text-emerald-500 line-through opacity-70"
                                                    : "bg-primary/10 text-primary hover:bg-primary/20",
                                                isSelected && "bg-white/20 text-white"
                                            )}
                                        >
                                            {task.text}
                                        </div>
                                    ))}
                                    {dayTasks.length > 3 && (
                                        <div className={cn(
                                            "text-[10px] sm:text-xs px-1 font-medium text-muted-foreground",
                                            isSelected && "text-white/70"
                                        )}>
                                            +{dayTasks.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>

            {/* Task Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[400px] border-none shadow-2xl bg-background/95 backdrop-blur-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-light">
                            {selectedDate ? format(selectedDate, "EEEE, MMMM do") : "Tasks"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-6 space-y-3 max-h-[300px] overflow-y-auto px-1">
                        {selectedDate && getTasksForDay(selectedDate).length === 0 && (
                            <div className="text-center py-4 text-muted-foreground/50 italic text-sm">
                                No tasks for this day.
                            </div>
                        )}
                        {selectedDate && getTasksForDay(selectedDate).map(task => (
                            <div key={task.id} className="flex items-center justify-between group animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center gap-3 overflow-hidden flex-1">
                                    <button
                                        onClick={() => toggleTask(format(selectedDate, "yyyy-MM-dd"), task.id)}
                                        className="text-muted-foreground hover:text-primary transition-colors"
                                        aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                                    >
                                        {task.completed ? <CheckCircle2 className="h-5 w-5 text-primary/50" /> : <Circle className="h-5 w-5" />}
                                    </button>
                                    <span className={cn("text-sm truncate flex-1 transition-all", task.completed && "line-through text-muted-foreground/50")}>{task.text}</span>
                                </div>
                                <button
                                    onClick={() => deleteTask(format(selectedDate, "yyyy-MM-dd"), task.id)}
                                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all text-destructive/70 hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-full"
                                    aria-label="Delete task"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleAddTask} className="flex gap-2 mt-2">
                        <Input
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            placeholder="New task..."
                            className="flex-1 bg-muted/20 border-none focus-visible:ring-1"
                            autoFocus
                        />
                        <Button type="submit" size="icon" variant="secondary" className="shrink-0" aria-label="Add new task">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </Card >
    );
}
