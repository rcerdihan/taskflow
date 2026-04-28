# TaskFlow - Premium Kanban Board

TaskFlow is a modern, responsive, and interactive Kanban board application built for task management. It features a drag-and-drop interface, real-time updates, and a sleek UI.

## 🚀 Live Demo

**[Click here to view the live deployment]** *(Add your Vercel link here)*

### Demo Credentials
To test the application without registering, use the following credentials:
- **Email:** `test@example.com`
- **Password:** `password`

## ✨ Features

- **Drag and Drop Interface:** Seamlessly move tasks between columns or reorder them within the same column using `@dnd-kit`.
- **Full CRUD Operations:** Create, Read, Update, and Delete columns and tasks.
- **Authentication:** Secure user login and session management powered by NextAuth.js.
- **Mobile Responsive:** Optimized for both desktop and mobile devices with touch sensors.
- **Modern UI:** Built with Tailwind CSS, featuring glassmorphism, dynamic gradients, and smooth micro-animations.
- **Database Persistence:** Real-time data syncing and persistence using Prisma ORM with PostgreSQL.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (via Prisma Postgres)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [NextAuth.js v5](https://authjs.dev/)
- **Drag & Drop:** [@dnd-kit](https://docs.dndkit.com/)
- **Deployment:** Vercel

## 💻 Local Development

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd taskflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your database URL:
   ```env
   DATABASE_URL="your-postgresql-url"
   AUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Push the database schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Seed the database with demo data:
   ```bash
   node prisma/seed.js
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 License
This project was developed as a technical assessment.
