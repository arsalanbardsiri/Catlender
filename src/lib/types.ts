export interface Task {
    id: string;
    text: string;
    completed: boolean;
    createdAt: number;
}

// DSA LESSON: HASH MAPS
// Instead of an array of tasks like: [{ date: '2025-01-01', text: '...' }, ...]
// We use a "Map" or "Dictionary" where the KEY is the date string.
//
// Structure:
// {
//   "2025-01-01": [Task1, Task2],
//   "2025-01-02": [Task3]
// }
//
// Why?
// Lookup Time: O(1) - Instant. We don't have to loop through all tasks to find today's.
export type TaskMap = Record<string, Task[]>;
