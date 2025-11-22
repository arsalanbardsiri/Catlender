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
import { Label } from "@/components/ui/label";
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
        <Card className="w-full h-full shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-2xl font-bold capitalize">
                    {getMonthTitle(currentDate)}
                </CardTitle>
                <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                    {weekDays.map((day) => (
                        <div key={day} className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* The Grid */}
                <div className="grid grid-cols-7 gap-px bg-muted/20 rounded-lg overflow-hidden border">
                    {days.map((day, index) => {
                        const dayTasks = getTasksForDay(day.date);
                        return (
                            <div
                                key={index}
                                onClick={() => handleDayClick(day.date)}
                                className={cn(
                                    "min-h-[80px] md:min-h-[100px] p-2 bg-background transition-colors hover:bg-accent/50 cursor-pointer flex flex-col gap-1 relative group",
                                    !day.isCurrentMonth && "bg-muted/5 text-muted-foreground",
                                    day.isToday && "bg-accent/20"
                                )}
                            >
                                <div className={cn(
                                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ml-auto",
                                    day.isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                )}>
                                    {day.date.getDate()}
                                </div>

                                {/* Tasks */}
                                <div className="flex flex-col gap-1 mt-1">
                                    {dayTasks.slice(0, 3).map((task) => (
                                        <div
                                            key={task.id}
                                            className={cn(
                                                "h-1.5 rounded-full w-full",
                                                task.completed ? "bg-muted-foreground/30" : "bg-primary/70"
                                            )}
                                            title={task.text}
                                        />
                                    ))}
                                    {dayTasks.length > 3 && (
                                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 mx-auto" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>

            {/* Task Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedDate ? format(selectedDate, "EEEE, MMMM do") : "Tasks"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4 space-y-2 max-h-[300px] overflow-y-auto">
                        {selectedDate && getTasksForDay(selectedDate).length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No tasks yet.</p>
                                <p className="text-xs">Type below to add one!</p>
                            </div>
                        )}
                        {selectedDate && getTasksForDay(selectedDate).map(task => (
                            <div key={task.id} className="flex items-center justify-between bg-muted/30 p-2 rounded-md group hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden flex-1">
                                    <button
                                        onClick={() => toggleTask(format(selectedDate, "yyyy-MM-dd"), task.id)}
                                        className="text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {task.completed ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5" />}
                                    </button>
                                    <span className={cn("text-sm truncate flex-1", task.completed && "line-through text-muted-foreground")}>{task.text}</span>
                                </div>
                                <button
                                    onClick={() => deleteTask(format(selectedDate, "yyyy-MM-dd"), task.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 p-1 rounded"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleAddTask} className="flex gap-2 mt-2">
                        <Input
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            placeholder="Add a task..."
                            className="flex-1"
                            autoFocus
                        />
                        <Button type="submit" size="icon">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
