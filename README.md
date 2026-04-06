# Track-Finance

Track Finance is a full-stack financial management system designed to handle secure transaction tracking, role-based access, and analytical dashboards. It bridges a robust backend architecture with a modern, responsive frontend UI to deliver a seamless user experience.

🎯 Objective Build a secure and scalable financial system Enable role-based interaction (Admin, Analyst, Viewer) Provide real-time financial insights and data

🛠️ Technology Stack

🔹 Frontend React.js (Vite) Responsive UI with modern dark theme React Router (Protected Routes) Context API for authentication

🔹 Backend Java + Spring Boot Spring Security with JWT authentication RESTful API architecture

🔹 Database MySQL with JPA (Hibernate)

🏗️ System Architecture Layered backend structure: Controller → Service → Repository → Database Frontend with reusable components and centralized auth state Secure API communication using

🔐 Authentication & Security Implemented JWT-based authentication Role-Based Access Control (RBAC) with: Admin → Full control Analyst → Read-only transactions Viewer → Dashboard-only access Backend protection using @PreAuthorize Frontend route protection and conditional rendering

💰 Core Features

📊 Financial Dashboard Displays: Total Income Total Expense Net Balance Clean, minimal, and role-aware interface 💳 Transaction Management Full CRUD operations (Admin only) Analysts can view data Features: Sorting (Date & Amount) Pagination (20 records/page) Input validation & constraints

👥 User & Role Management Role assignment (Admin, Analyst, Viewer) Admin-controlled permissions Secure access restrictions across system

🎨 UI/UX Enhancements Modern dark theme (#0f172a) Consistent branding: “TRACK FINANCE” Fully responsive design: Desktop → centered layout Mobile → hamburger navigation Improved forms, tables, and navigation Sticky footer and polished layout

⚡ Key Improvements Implemented Role-based API restrictions (backend enforced) Dynamic frontend access control Transaction sorting & pagination Responsive navigation system Simplified and optimized dashboard

📈 Development Highlights Designed scalable backend architecture Implemented secure authentication system Built real-world financial data workflows Focused on clean UI and user experience Followed industry-standard coding practices

🏁 Final Outcome Fully functional role-based financial system Secure, responsive, and scalable application Demonstrates backend design, security, and frontend

💡 Key Skills Demonstrated Backend Development (Spring Boot) Database Design (MySQL) Authentication & Security (JWT, RBAC) Frontend Development (React) API Design & Integration UI/UX Design & Responsiveness
