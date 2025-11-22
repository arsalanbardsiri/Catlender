import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    addMonths,
    subMonths,
} from "date-fns";

/**
 * DSA LESSON: MATRICES (2D ARRAYS)
 *
 * A calendar is visually a grid (a table). In computer science, we often represent grids
 * as a "Matrix" or a "2D Array" (an array of arrays).
 *
 * Example of a 3x3 Matrix:
 * [
 *   [1, 2, 3],
 *   [4, 5, 6],
 *   [7, 8, 9]
 * ]
 *
 * For our calendar, we want to generate a grid where each cell contains a Date object.
 *
 * Algorithm:
 * 1. Find the first day of the month.
 * 2. Find the last day of the month.
 * 3. "Pad" the start: Find the start of the week for the first day (e.g., if month starts on Tuesday, we need Sunday and Monday from prev month).
 * 4. "Pad" the end: Find the end of the week for the last day.
 * 5. Generate a linear list of all days between Start-Padding and End-Padding.
 * 6. (Optional) Chunk this linear list into weeks (rows) to create the 2D Matrix structure.
 */

export type CalendarDay = {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
};

export function generateCalendarGrid(currentDate: Date): CalendarDay[] {
    // 1. Find the "boundaries" of our visible grid
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);

    const startDate = startOfWeek(monthStart); // Pad start
    const endDate = endOfWeek(monthEnd); // Pad end

    // 2. Generate the linear array of days
    // This gives us a 1D array: [Sun, Mon, Tue, ..., Sat]
    const dateFormat = "d";
    const rows = [];

    const daysInGrid = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    // 3. Transform simple Dates into rich "CalendarDay" objects
    const calendarDays: CalendarDay[] = daysInGrid.map((day) => {
        return {
            date: day,
            isCurrentMonth: day.getMonth() === monthStart.getMonth(),
            isToday: day.toDateString() === new Date().toDateString(),
        };
    });

    return calendarDays;
}

// Helper to get the name of the month and year (e.g., "November 2025")
export function getMonthTitle(date: Date): string {
    return format(date, "MMMM yyyy");
}

// Navigation helpers
export function getNextMonth(date: Date): Date {
    return addMonths(date, 1);
}

export function getPrevMonth(date: Date): Date {
    return subMonths(date, 1);
}
