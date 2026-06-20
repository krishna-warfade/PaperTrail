# PaperTrail: Collaborative Research Project Management Platform

PaperTrail is a centralized workspace designed for student research teams and faculty guides to collaborate throughout the research lifecycle. It addresses the fragmentation of information caused by managing papers, notes, progress reports, faculty feedback, and team discussions across separate channels such as Google Docs, Drive, WhatsApp, and email.

## Key Features and Roles

### Roles
* **Leader**: Create research projects, invite team members, invite faculty guides, and manage tasks.
* **Member**: Upload research papers, add reference notes, and log project progress.
* **Faculty Guide**: Review team progress logs, add suggestions, and comment on document submissions.

### Core Workflow
1. Leader registers and creates a project.
2. Leader invites members and faculty guides via email.
3. Invitees accept the invitation to join the project workspace.
4. Team members upload relevant research papers and write notes.
5. Team members record daily or weekly progress logs.
6. Faculty guides review the progress logs and leave feedback or comments.
7. The project dashboard visualizes the active timeline, documents, and comments.

---

## Technology Stack

### Frontend
* React
* Tailwind CSS
* React Router

### Backend
* Node.js
* Express

### Database
* MongoDB
* Mongoose ODM

### Authentication & Services
* JWT (JSON Web Tokens) for session authorization
* bcrypt for secure password hashing
* Nodemailer for email-based invitation flows
* Cloudinary for paper storage

---

## System Architecture

The application uses an MVC (Model-View-Controller) architecture on the backend to decouple database schemas, application controllers, and route definitions. 

### Directory Structure
```text
PaperTrail/
├── server/
│   ├── config/             # Connection configurations (database, storage, mailer)
│   ├── controllers/        # Express request handlers containing business logic
│   ├── middlewares/        # Authentication, authorization, and upload middlewares
│   ├── models/             # Mongoose schemas (User, Project, Invitation, Paper, etc.)
│   ├── routes/             # REST API endpoint route definitions
│   ├── services/           # External API integrations
│   ├── utils/              # General helper functions
│   ├── server.js           # Express application entry point
│   ├── package.json
│   └── .env
└── README.md
```

### Database Design

* **User**: name, email, password (hashed), role (LEADER, MEMBER, FACULTY)
* **Project**: title, description, leader (Ref: User), faculty (Ref: User), members (Ref: User Array)
* **Invitation**: email, projectId (Ref: Project), role, token, status (PENDING, ACCEPTED, REJECTED)
* **Paper**: title, authors, year, keywords, projectId (Ref: Project), uploadedBy (Ref: User), pdfUrl
* **Note**: paperId (Ref: Paper), authorId (Ref: User), content
* **ProgressLog**: projectId (Ref: Project), userId (Ref: User), description, date
* **Comment**: projectId (Ref: Project), authorId (Ref: User), content, createdAt

---

## Installation and Execution

### Prerequisites
* Node.js (version 18 or above recommended)
* MongoDB database instance (local community server or MongoDB Atlas cluster)

### Setup Instructions

1. **Clone and navigate to the project directory**:
   ```bash
   cd PaperTrail
   ```

2. **Configure environment variables**:
   Create a `.env` file in the `server` directory and configure the variables based on the template:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your_smtp_username
   SMTP_PASS=your_smtp_password
   SMTP_FROM=noreply@papertrail.com
   ```

3. **Install dependencies inside the server directory**:
   ```bash
   cd server
   npm install
   ```

4. **Run the server in development mode**:
   ```bash
   npm run dev
   ```
