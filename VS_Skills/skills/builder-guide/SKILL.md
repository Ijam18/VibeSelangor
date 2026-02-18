---
name: Builder Guide
description: A comprehensive manual for building, shipping, and monetizing AI-powered web applications.
---

# 🏗️ The Builder's Guide: From Zero to One

Welcome to the ultimate guide for building modern web applications with AI, tailored for the **VibeSelangor** ecosystem. This document covers everything from setting up your environment to pitching your final product.

## 1. 🛠️ Preparation & Prerequisites

Before you start building, ensure your "digital workshop" is ready.

### 🧠 The Builder's Mindset
-   **Building an App** = Constructing a **Building**. You need a strong foundation (database), security (walls/locks), and utility (features) for people to live in.
-   **Visiting Apps** = Walking into someone else's building.
-   **GitHub** = Your **Warehouse**. Pushing/Pulling is updating your inventory.
-   **OpenClaw** = The **Consciousness** of your Virtual Proxy. Installing it gives your agent "self-awareness" to provide better feedback.

### Essential Tools
-   **Antigravity Agent**: Your primary AI partner.
-   **Cursor/VS Code**: The code editor.
-   **Node.js (LTS)**: JavaScript runtime.
-   **Git**: Version control.

### The Stack
We recommend the following stack for speed and scalability (aligned with VibeSelangor):
-   **Framework**: Vite (React).
-   **Styling**: Tailwind CSS (Standard for VibeSelangor).
-   **Database**: Supabase (PostgreSQL + Auth).
-   **Deployment**: Vercel.

---

## 2. 🧠 Prompting Mastery: The "2-3 Rule"

The biggest mistake new builders make is overwhelming the AI.

### 🚫 The Mistake
> "Build me a fully functional e-commerce site with a cart, stripe integration, and a admin dashboard, also make it blue."
> *(Result: The AI gets confused, hallucinates, or produces broken code.)*

### ✅ The "2-3 Rule"
Limit your prompts to **2-3 specific instructions** at a time.

### 🛑 The "Stop & Think" Protocol
A common trap is getting fixated on a broken feature and burning through tokens.
1.  **The Limit**: If a feature isn't working after **3 attempts**, STOP.
2.  **The Question**: Ask yourself, "Is this critical for the MVP? or am I just obsessing?"
3.  **The Pivot**: If it's not critical, **kill it** or simplify it.
4.  **Token Discipline**: Every failed prompt is wasted cost. Be strategic.

### 🌟 The "Master Prompt" (Initialization)
While the "2-3 Rule" is for iteration, your **first** prompt should be a "Master Prompt." This sets the foundation for your entire building.

**The Master Prompt Template:**
> "Initialize a [Stack: Vite/React/Tailwind] app called [Name].
> **Goal**: [Brief problem & solution].
> **Theme**: [Design Style], [Primary Colors], [Fonts].
> **Core Features**:
> 1. [Feature 1]
> 2. [Feature 2]
> 3. [Feature 3]
> **User Flow**: [How a user interacts from land to goal].
> **Security**: [RLS, Env variables, Input validation].
> **Structure**: [Follow standard /src structure]."

#### Example Workflow:
1.  **Prompt 1**: "Create a responsive navbar with a logo on the left and 'Home', 'About', 'Contact' links on the right."
2.  **Prompt 2**: "Style the navbar to have a glassmorphism effect with a blur background and sticky positioning."
3.  **Prompt 3**: "Add a mobile hamburger menu that slides in from the right when clicked."

### Building Your First Component
1.  **Identify**: What component do you need? (e.g., "Hero Section").
2.  **Describe**: What does it look like? (e.g., "Large title, subtitle, two CTA buttons").
3.  **Refine**: Add specific style constraints (e.g., "Use the VibeSelangor Red (#CE1126) for the primary button").

---

## 3. 💡 Ideation & Strategy

Don't just build code; build a solution.

### Core Questions (The "Why")
-   **Problem**: What specific pain point are you solving?
-   **Solution**: How does your app solve it better/faster/cheaper?
-   **User**: Who is desperate for this solution?
-   **Pitch**: Can you explain it in one sentence? (*"Uber for Dog Walkers"*)

### Monetization Models
-   **Freemium**: Free core features, paid premium features.
-   **Subscription (SaaS)**: Monthly/Yearly recurring revenue.
-   **One-time Purchase**: Pay once for a digital asset.
-   **Ads/Sponsorship**: Traffic-based revenue.

---

## 4. 💻 Building the App

### Step 1: File Structure & Security
Keep your project organized.
```text
/src
  /components # Reusable UI components
  /pages      # App routes
  /lib        # Utility functions (supabase, helpers)
  /assets     # Static assets (images, icons)
```
**Security Hardening**:
-   Never commit `.env` files.
-   Use Row Level Security (RLS) in Supabase.
-   Validate all user inputs.

### Step 2: Design Identity
Don't just copy. Create.
-   **Find Your Style**: Are you Minimalist? Brutalist? Retro-Pop? Cyber-Y2K?
-   **Theme**:
    -   **Primary**: Selangor Red (`#CE1126`).
    -   **Background**: Deep Black (`#0a0a0a`).
    -   **Accent**: Pick a color that represents *you*.
-   **Font**: Inter or Plus Jakarta Sans.
-   **Vibe**: Bold, energetic, community-driven.

> **Pro Tip**: Don't default to glassmorphism unless it fits the vibe. Explode the box.

### Step 3: APIs & Data
-   **Fetching**: Use `fetch`, `axios`, or TanStack Query.
-   **Scraping**: If you need external data, use tools like Firecrawl or simple puppeteer scripts (respecting `robots.txt`).

---

## 5. 🚀 Deployment

### GitHub
1.  Initialize git: `git init`
2.  Commit changes: `git add . && git commit -m "Initial commit"`
3.  Push to a new repository.

### Vercel
1.  Import your GitHub repo into Vercel.
2.  Add your Environment Variables (from your `.env`).
3.  Click **Deploy**.

### Supabase
1.  Create a new project.
2.  Get your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
3.  Run the SQL editor to set up your tables.

---

## 🏘️ Town Planning: Best Practices

Ensuring your "Building" is sustainable requires good planning.

-   **Keep the Home Clean**: Regularly "sweep" your folders. Delete unused components and clean up your imports. A cluttered home confuses your Virtual Proxy.
-   **Document the District**: Add brief `// comments` to complex logic. Think of these as "Public Signage" to help other Proxies navigate your work.
-   **Build for Residents, not Tourists**: Focus on utility. Don't add features just for show; ensure your users can actually live and thrive in your app.
-   **Secure the Perimeter**: Your Building is only as strong as its walls. Check your Supabase RLS policies and validate every input.

---

## 6. 🔧 Troubleshooting

When things break (and they will):

1.  **Read the Error**: 90% of the solution is in the error message.
2.  **Paste & Go**: Copy the **exact error code/stack trace** and paste it into the agent. Don't summarize; give the raw data.
3.  **Visual Context**: If it's a UI issue, provide a **screenshot**. Your Virtual Proxy needs to "see" the district to fix it.
4.  **Explain the Vibe**: If the code is right but it feels wrong, **describe the problem**. "It feels laggy," or "The transition is too jarring."
5.  **Isolate**: Comment out code until it works again to find the culprit.
6.  **Check Logs**: Look at the terminal or browser console.

> [!TIP]
> **"It works on my machine"** is not a valid excuse. Always test your production deployment!
