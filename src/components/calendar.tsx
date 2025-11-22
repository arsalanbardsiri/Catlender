
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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        <div className="w-full max-w-4xl mx-auto p-4">
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

            <div className="grid grid-cols-7 gap-1 mb-2 text-center font-semibold text-muted-foreground">
                {weekDays.map((day) => (
                    <div key={day}>{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                    const dayTasks = getTasksForDay(day.date);
                    return (
                        <div
                            key={index}
                            onClick={() => handleDayClick(day.date)}
                            className={cn(
                                "min-h-[120px] p-2 border rounded-lg transition-colors hover:bg-accent/50 cursor-pointer flex flex-col gap-1",
                                !day.isCurrentMonth && "opacity-50 bg-muted/30",
                                day.isToday && "border-primary border-2"
                            )}
                        >
                            <div className="text-right text-sm font-medium mb-1">
                                {day.date.getDate()}
                            </div>

                            {/* Render Tasks as small pills */}
                            <div className="flex flex-col gap-1 overflow-hidden">
                                {dayTasks.slice(0, 3).map((task) => (
                                    <div
                                        key={task.id}
                                        className={cn(
                                            "text-[10px] p-1 rounded truncate",
                                            task.completed ? "bg-muted text-muted-foreground line-through" : "bg-primary/10 text-primary"
                                        )}
                                    >
                                        {task.text}
                                    </div>
                                ))}
                                {dayTasks.length > 3 && (
                                    <div className="text-[10px] text-muted-foreground pl-1">
                                        +{dayTasks.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Task Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            Tasks for {selectedDate ? format(selectedDate, "MMMM do, yyyy") : ""}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Task List for Selected Date */}
                    <div className="py-4 space-y-2 max-h-[300px] overflow-y-auto">
                        {selectedDate && getTasksForDay(selectedDate).length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No tasks yet. Add one below!</p>
                        )}
                        {selectedDate && getTasksForDay(selectedDate).map(task => (
                            <div key={task.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md group">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <button onClick={() => toggleTask(format(selectedDate, "yyyy-MM-dd"), task.id)}>
                                        {task.completed ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                                    </button>
                                    <span className={cn("text-sm truncate", task.completed && "line-through text-muted-foreground")}>{task.text}</span>
                                </div>
                                <button
                                    onClick={() => deleteTask(format(selectedDate, "yyyy-MM-dd"), task.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add Task Form */}
                    <form onSubmit={handleAddTask} className="flex gap-2 mt-4">
                        <Input
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            placeholder="Add a new task..."
                            className="flex-1"
                        />
                        <Button type="submit" size="sm">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

