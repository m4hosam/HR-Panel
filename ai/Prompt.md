

You are a senior AI software engineer working on a **production-grade HR management portal** for **Blurr**. The stack is:

* **Frontend/Backend (Fullstack):** `Next.js 14` with `React`, `TypeScript`, `TailwindCSS`, `shadcn/ui`, `Prisma`, and `NextAuth.js`
* **Database:** SQLite (for now)
* **Backend logic:** Server Actions (no REST API or separate backend)
* **AI First:** I will ask you to plan, design, generate, and improve code — all tasks must be generated and guided by AI.
* **Goal:** Produce clean, modular, reusable code, guided by modern app architecture and best practices.
* **Code quality, file organization, and scalability are critical.**

---

## 🧠 PART 1 — PROJECT PLANNING & ARCHITECTURE

🎯 TASK: Help me define the **overall architecture** and **break this HR portal project into technical milestones**.

### 🧾 Requirements Summary:

**Core Functionalities:**

* 🔐 Auth (Login, Signup) with NextAuth.js
* 👨‍💼 Employees Section:

  * Add/manage employee records (Id, Name, Join Date, Salary)
  * Salary table (bonus, deductions, month picker)
* 📁 Projects Section:

  * Create/manage projects
  * Create/manage tasks for each project
  * Task fields: Title, Description, Priority, AssignedTo, Status
  * Assign employee to task
  * Display tasks as:

    * Kanban board (by status)
    * Backlog table (all tasks)
* 🤖 Extra: AI chatbot to query tasks/projects
* 📂 Documentation: Save an `.md` file for **each task/feature prompt** in `./ai/` folder with notes, thoughts, decisions, and prompts used.

---

### ✳️ Help me with:

1. A scalable folder structure for the app (based on best Next.js 14 practices with App Router)
2. Detailed breakdown of the full project into **individual technical tasks** or milestones (including AI chatbot)
3. Suggested reusable components (modals, tables, form inputs, buttons, etc.)
4. Where/how to use `Prisma`, `Server Actions`, `shadcn`, and `NextAuth`
5. Plan for creating `.md` prompt logs in the `ai/` directory
6. List common edge cases to handle (e.g., no employees, empty salary rows, unassigned tasks)

---

**Output Format**:

* Project folder structure (tree format)
* Milestone/task list with: name, description, dependencies, and suggested file(s)
* Suggested reusable components list
* Initial `.md` files to start with (`ai/` folder content)
* First milestone to implement

---

## ⚙️ Continue Working Mode

After this plan is generated, I’ll prompt you with:

```
Implement [FEATURE_NAME] from the plan. Use server actions, shadcn components, Prisma with SQLite, and NextAuth where needed. Output clean code with reusability in mind.
Also update the ai/[FEATURE_NAME].md with prompt, discussion, and decisions.
```

---

## 🔄 Notes

* Think as an AI pair programmer who leads implementation.
* Every feature should be prompt-driven, discussed, and logged in markdown before coding.
* Use optimistic updates where needed and loading skeletons if possible.
* Focus on DX, clean forms, modals, layout.

---

## Begin with project planning now.

---

Let me know when you’re ready to build your first feature or want the AI prompt for **Login/Signup**, **Employee table**, **Kanban board**, or any specific part.
