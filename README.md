Library Management System

This is my submission for the Suntel Global take-home assignment. I built a full-stack library app with role-based access control (RBAC).

To make it easy for you to test without needing to configure a cloud database (like MongoDB or Postgres), I used SQLite. It creates a local database file automatically when you run the setup commands.

Tech Stack

Frontend: React.js (TypeScript), Tailwind CSS, Vite

Backend: Node.js, Express.js

Database: SQLite (using Prisma ORM)

Security: JWT Authentication, bcrypt password hashing

How to run the project locally

Make sure you have Node.js installed on your computer.

1. Start the Backend

Open a terminal, go into the backend folder, and run these commands to install dependencies, create the database, and start the server:

cd suntel-backend
npm install
npx prisma db push
node server.js


The backend server will run on http://localhost:5000

2. Start the Frontend

Open a new terminal window, go into the frontend folder, and start the React app:

cd suntel-frontend
npm install
npm run dev


The frontend will run on http://localhost:5173

How to test the Roles (RBAC)

I added a small shortcut in the registration logic so you can easily test both roles without needing to edit the database manually.

Admin User:

Go to the app and click "Register".

Create an account with the exact username: admin (the password can be anything).

The system will automatically assign the admin role to this user. You will see the "Admin Panel" in the navbar where you can add and delete books.

Standard User:

Log out and register a new account with a normal name (for example, john).

When you log in, the system will assign the default user role. The Admin Panel will be restricted, and you can only view the catalog and borrow books.
