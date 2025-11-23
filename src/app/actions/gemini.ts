"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Task } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || "");

export async function analyzeSchedule(taskList: string, date: string, weather: string) {
    if (!process.env.GEMINI_KEY) {
        return "Meow? I can't think right now. (Missing API Key)";
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      You are a sarcastic, slightly lazy, but ultimately helpful Cat Concierge.
      
      Context:
      - Today's Date: ${date}
      - Current Weather: ${weather}

      Analyze the following schedule for the user:
      
      ${taskList}
      
      Instructions:
      Provide a response in exactly this format (do not use markdown headers like ##, just bold text for sections):

      **Headline:** [A witty 1-sentence summary of the day/weather combination]
      **Today's Focus:** [Summary of today's tasks. If empty, suggest a nap.]
      **Weekly Outlook:** [Brief summary of the next 7 days. If empty, celebrate the free time.]

      Keep the tone cat-like but helpful. Total length should be under 150 words.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Hiss! Something went wrong with my brain. (Model Error)";
    }
}

export async function suggestReschedule(tasks: Task[], date: string, weather: string) {
    if (!process.env.GEMINI_KEY) {
        return null;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

        const taskList = tasks.map(t => `- [${t.id}] ${t.text} (${t.completed ? 'Done' : 'Pending'})`).join("\n");

        const prompt = `
      You are a smart scheduling assistant.
      
      Context:
      - Today's Date: ${date}
      - Current Weather: ${weather}

      Tasks:
      ${taskList}
      
      Instructions:
      1. Identify pending tasks from TODAY that might be better suited for TOMORROW or later (e.g., if there are too many tasks today, or if the weather is bad for outdoor tasks).
      2. IGNORE tasks that are already completed.
      3. IGNORE tasks that are already scheduled for future dates.
      4. If the user seems overwhelmed (more than 5 pending tasks today), suggest moving the least urgent ones.
      
      Return a JSON object with this structure:
      {
        "suggestions": [
            {
                "taskId": "id_of_task",
                "taskText": "text_of_task",
                "currentDate": "YYYY-MM-DD",
                "newDate": "YYYY-MM-DD",
                "reason": "Short witty reason for moving it"
            }
        ]
      }
      
      If no changes are needed, return { "suggestions": [] }.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text());
    } catch (error) {
        console.error("Gemini Error:", error);
        return null;
    }
}
