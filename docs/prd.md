Act as a Senior Full Stack Web Developer proficient in **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma** (with SQLite for ease of setup).

I need you to build a web application named **"Stitch Auto-Credit"**. The core purpose of this app is to automate and schedule the login/logout process for specific "agent routers" to collect credits. This requires managing multiple session cookies and triggering API requests at specific times.

### Technology Stack & Architecture

* **Framework:** Next.js 14 (App Router) with TypeScript.
* **UI/Styling:** Tailwind CSS with a component library (preferably **shadcn/ui** for standard components like Tables, Forms, Dialogs, and Buttons).
* **Database:** SQLite managed by **Prisma ORM**.
* **State Management/Fetching:** **TanStack Query (React Query) v5** for frontend data fetching and caching. Zustand for simple local state if needed.
* **Task Scheduling:** Use a reliable Node.js scheduling library like **`node-cron`** on the server side.

---

### Core Features to Implement

#### 1. Page: Cookie Management (`/cookies`)
* **Feature:** A CRUD interface to manage session cookies.
* **UI:**
    * A table displaying stored cookies with columns: `Label`, `Cookie String (truncated)`, `Status` (e.g., Active/Unknown), and `Actions` (Edit, Delete).
    * A dynamic Modal/Dialog form to `Add` or `Edit` a cookie.
* **Input Fields:**
    * `Label`: A friendly name for the account (e.g., "Account_A").
    * `CookieValue`: The full cookie string used for authentication.
* **Backend:** Prisma model `Cookie` storing `id`, `label`, `value`, `status`. Create API Routes (`/api/cookies`) for CRUD.

#### 2. Page: Scheduler (`/scheduler`)
* **Feature:** Interface to create and manage scheduled login/logout tasks.
* **UI:**
    * Table showing schedules: `Task Name`, `Associated Cookie Label`, `Time`, `Type` (Login/Logout), `Is Active`, `Actions`.
    * Form to create a schedule.
* **Input Fields:**
    * `Task Name`: (e.g., "Daily Login Account A").
    * `Cookie ID`: Dropdown selection from stored cookies.
    * `Time Picker`: Select hour and minute (e.g., 08:00).
    * `Type`: Dropdown (Login, Logout, or Login-then-Logout sequential).
* **Backend:** Prisma model `Schedule`. A server-side runner must listen to these schedules and trigger the API.

#### 3. Page: Log History (`/logs`)
* **Feature:** Read-only view of all executed automated tasks.
* **UI:** Table with filtering options.
* **Columns:** `Timestamp`, `Schedule Name`, `Cookie Label`, `Action Type`, `Status` (Success/Failed), `Router Response`.
* **Backend:** Prisma model `Log`. API Route (`/api/logs`).

---

### API Integration Logic (Crucial)

This is how the automated system must interact with the agent router. Based on Burp Suite analysis, here is the technical structure. in file api.md

