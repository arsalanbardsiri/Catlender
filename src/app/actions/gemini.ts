"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Task } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || "");

export async function analyzeSchedule(tasks: Task[]) {
    if (!process.env.GEMINI_KEY) {
        return "Meow? I can't think right now. (Missing API Key)";
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const taskList = tasks.map(t => `- ${t.text} (${t.completed ? 'Done' : 'Pending'})`).join("\n");

        const prompt = `
      You are a sarcastic, slightly lazy, but ultimately helpful Cat Concierge.
      Analyze the following list of tasks for the user:
      
      ${taskList}
      
      Give a short, witty summary (max 2 sentences) of their schedule. 
      If the list is empty, make a joke about napping.
      If they have a lot of tasks, tell them to hurry up so they can pet you.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Hiss! Something went wrong with my brain.";
    }
}
