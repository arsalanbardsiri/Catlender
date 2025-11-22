"use client";

import { useState, useEffect } from "react";
import { Task, TaskMap } from "@/lib/types";

const STORAGE_KEY = "catlender_tasks";

export function useTasks() {
    // The State: A Hash Map of tasks
    const [tasks, setTasks] = useState<TaskMap>({});

    // Load from LocalStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setTasks(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse tasks", e);
            }
        }
    }, []);

    // Save to LocalStorage whenever tasks change
    useEffect(() => {
        // We only save if tasks is not empty (to avoid wiping data on initial render if logic was different)
        // But here, since we initialize with {}, we should be careful.
        // A better pattern for strict React strict mode is to have a separate "isLoaded" flag,
        // but for this simple app, we'll just save.
        if (Object.keys(tasks).length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        }
    }, [tasks]);

    // O(1) Operation: Add Task
    const addTask = (dateKey: string, text: string) => {
        const newTask: Task = {
            id: crypto.randomUUID(),
            text,
            completed: false,
            createdAt: Date.now(),
        };

        setTasks((prev) => {
            const currentDayTasks = prev[dateKey] || [];
            const newMap = {
                ...prev,
                [dateKey]: [...currentDayTasks, newTask],
            };
            // Manually save here to ensure it persists even if the effect hasn't run yet
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newMap));
            return newMap;
        });
    };

    // O(1) Operation: Delete Task
    const deleteTask = (dateKey: string, taskId: string) => {
        setTasks((prev) => {
            const currentDayTasks = prev[dateKey] || [];
            const newMap = {
                ...prev,
                [dateKey]: currentDayTasks.filter((t) => t.id !== taskId),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newMap));
            return newMap;
        });
    };

    // O(1) Operation: Toggle Completion
    const toggleTask = (dateKey: string, taskId: string) => {
        setTasks((prev) => {
            const currentDayTasks = prev[dateKey] || [];
            const newMap = {
                ...prev,
                [dateKey]: currentDayTasks.map((t) =>
                    t.id === taskId ? { ...t, completed: !t.completed } : t
                ),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newMap));
            return newMap;
        });
    };

    return { tasks, addTask, deleteTask, toggleTask };
}
