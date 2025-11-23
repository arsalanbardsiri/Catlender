"use client";

import { useState, useEffect } from "react";
import { Task, TaskMap } from "@/lib/types";
import { supabase } from "@/lib/supabase";

export function useTasks() {
    const [tasks, setTasks] = useState<TaskMap>({});
    const [loading, setLoading] = useState(true);

    // Fetch tasks from Supabase
    useEffect(() => {
        const fetchTasks = async () => {
            const { data, error } = await supabase
                .from("tasks")
                .select("*");

            if (error) {
                console.error("Error fetching tasks:", error);
                return;
            }

            // Transform flat list to TaskMap
            const newMap: TaskMap = {};
            data?.forEach((row: any) => {
                const dateKey = row.date;
                if (!newMap[dateKey]) {
                    newMap[dateKey] = [];
                }
                newMap[dateKey].push({
                    id: row.id,
                    text: row.text,
                    completed: row.completed,
                    createdAt: new Date(row.created_at).getTime(),
                });
            });
            setTasks(newMap);
            setLoading(false);
        };

        fetchTasks();
    }, []);

    const addTask = async (dateKey: string, text: string) => {
        // Optimistic Update
        const tempId = crypto.randomUUID();
        const newTask: Task = {
            id: tempId,
            text,
            completed: false,
            createdAt: Date.now(),
        };

        setTasks((prev) => {
            const current = prev[dateKey] || [];
            return { ...prev, [dateKey]: [...current, newTask] };
        });

        // DB Call
        const { data, error } = await supabase
            .from("tasks")
            .insert({
                text,
                date: dateKey,
                completed: false,
            })
            .select()
            .single();

        if (error) {
            console.error("Error adding task:", error);
            // Revert logic could go here
        } else if (data) {
            // Replace temp ID with real ID
            setTasks((prev) => {
                const current = prev[dateKey] || [];
                return {
                    ...prev,
                    [dateKey]: current.map((t) => (t.id === tempId ? { ...t, id: data.id } : t)),
                };
            });
        }
    };

    const deleteTask = async (dateKey: string, taskId: string) => {
        // Optimistic Update
        setTasks((prev) => {
            const current = prev[dateKey] || [];
            return { ...prev, [dateKey]: current.filter((t) => t.id !== taskId) };
        });

        // DB Call
        const { error } = await supabase.from("tasks").delete().eq("id", taskId);

        if (error) {
            console.error("Error deleting task:", error);
        }
    };

    const toggleTask = async (dateKey: string, taskId: string) => {
        // Find current status for optimistic update
        let newStatus = false;
        setTasks((prev) => {
            const current = prev[dateKey] || [];
            const task = current.find((t) => t.id === taskId);
            if (task) newStatus = !task.completed;

            return {
                ...prev,
                [dateKey]: current.map((t) =>
                    t.id === taskId ? { ...t, completed: !t.completed } : t
                ),
            };
        });

        // DB Call
        const { error } = await supabase
            .from("tasks")
            .update({ completed: newStatus })
            .eq("id", taskId);

        if (error) {
            console.error("Error toggling task:", error);
        }
    };

    const moveTask = async (taskId: string, oldDate: string, newDate: string) => {
        // Optimistic Update
        setTasks((prev) => {
            const oldList = prev[oldDate] || [];
            const taskToMove = oldList.find((t) => t.id === taskId);

            if (!taskToMove) return prev;

            const newList = prev[newDate] || [];

            return {
                ...prev,
                [oldDate]: oldList.filter((t) => t.id !== taskId),
                [newDate]: [...newList, taskToMove]
            };
        });

        // DB Call
        const { error } = await supabase
            .from("tasks")
            .update({ date: newDate })
            .eq("id", taskId);

        if (error) {
            console.error("Error moving task:", error);
            // In a real app, we would revert here
        }
    };

    return { tasks, addTask, deleteTask, toggleTask, moveTask, loading };
}
