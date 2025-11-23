# 🐱 Catlender

**The Purr-fect AI-Powered Task Manager**

Catlender is a whimsical yet powerful task management application that combines a beautiful, glassmorphic UI with advanced AI capabilities. It features a "Cat Concierge" that analyzes your schedule, provides daily briefings, and even suggests rescheduling tasks when you're overloaded—all with a charming feline personality.

![Catlender Preview](public/assets/preview.png)

## ✨ Features

-   **🎨 Premium UI**: A stunning dark-themed interface with glassmorphism, smooth animations, and a rich gradient background.
-   **🤖 Cat Concierge AI**: Powered by Google Gemini, this AI agent analyzes your tasks, gives you a 7-day outlook, and offers witty advice.
-   **📅 Smart Reschedule**: The AI proactively identifies overloaded days or "sick days" and suggests moving tasks to better dates (strictly with your permission).
-   **☁️ Cloud Persistence**: Tasks are securely stored in a Supabase database, ensuring your schedule is safe and accessible.
-   **🌤️ Weather Integration**: Automatically fetches local weather to give context to your schedule (e.g., "It's raining, maybe move that run to tomorrow?").
-   **📱 Responsive Design**: Fully optimized for desktop and mobile devices.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
-   **AI**: [Google Gemini API](https://ai.google.dev/) (`gemini-2.5-flash`)
-   **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
-   **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   A Supabase account
-   A Google AI Studio API Key

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/arsalanbardsiri/catlender.git
    cd catlender
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**:
    Create a `.env.local` file in the root directory and add:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_ANON_KEY=your_supabase_anon_key
    GEMINI_KEY=your_gemini_api_key
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deployment

This project is optimized for deployment on **Vercel**.

1.  Push your code to a GitHub repository.
2.  Import the project into Vercel.
3.  Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_ANON_KEY`, `GEMINI_KEY`) in the Vercel dashboard.
4.  Deploy! 🚀

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
