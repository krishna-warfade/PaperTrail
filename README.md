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
* bcryptjs for secure password hashing
* Nodemailer for email-based invitation flows
* Cloudinary for paper storage
* Multer for file upload handling
* CORS for cross-origin resource sharing

---

## System Architecture

The application uses an MVC (Model-View-Controller) architecture on the backend to decouple database schemas, application controllers, and route definitions. Source code is organized under a `src/` subdirectory within `server/`.

### Directory Structure
```text
PaperTrail/
├── server/
│   ├── src/
│   │   ├── config/             # Connection configurations (database)
│   │   ├── controllers/        # Express request handlers containing business logic
│   │   ├── middlewares/        # Authentication and authorization middlewares
│   │   ├── models/             # Mongoose schemas (User, Project)
│   │   └── routes/             # REST API endpoint route definitions
│   ├── tests/                  # Test scripts
│   ├── server.js               # Express application entry point
│   ├── package.json
│   └── .env
└── README.md
```

### Database Design

* **User**: name, email, password (hashed), role (LEADER, MEMBER, FACULTY)
* **Project**: title, description, leader (Ref: User), faculty (Ref: User), members (Ref: User Array)

---

## API Endpoints

### Authentication (`/api/auth`)
| Method | Route       | Description                  | Auth Required |
|--------|-------------|------------------------------|---------------|
| POST   | `/register` | Register a new user          | No            |
| POST   | `/login`    | Login and receive JWT token  | No            |
| GET    | `/me`       | Get current user profile     | Yes           |

### Projects (`/api/projects`)
| Method | Route  | Description                          | Auth Required | Role Required |
|--------|--------|--------------------------------------|---------------|---------------|
| POST   | `/`    | Create a new project                 | Yes           | LEADER        |
| GET    | `/`    | Get all projects for current user    | Yes           | Any           |
| GET    | `/:id` | Get a specific project by ID         | Yes           | Any (member)  |

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

   EMAIL_USER=your_email_address
   EMAIL_PASSWORD=your_email_app_password

   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
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
