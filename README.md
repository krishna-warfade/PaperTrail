# PaperTrail: Collaborative Research Project Management Platform

PaperTrail is a centralized workspace designed for student research teams and faculty guides to collaborate throughout the research lifecycle. It addresses the fragmentation of information caused by managing papers, notes, progress reports, faculty feedback, and team discussions across separate channels such as Google Docs, Drive, WhatsApp, and email.

## Key Features and Roles

### Roles
* **Leader**: Create research projects, invite team members, invite faculty guides, and manage tasks.
* **Member**: Upload research papers, add reference notes, log project progress, and participate in discussions.
* **Faculty Guide**: Review team progress logs, add suggestions/comments, and comment on document submissions.

### Core Workflow
1. Leader registers and creates a project.
2. Leader invites members and faculty guides via email.
3. Invitees accept the invitation to join the project workspace.
4. Team members upload relevant research papers, write notes, and log project progress.
5. Faculty guides review the progress logs and leave suggestions or comments.
6. The project dashboard visualizes the active timeline (activity feed), documents, progress log contributions, and project comments.

---

## Technology Stack

### Frontend
* React
* Tailwind CSS
* React Router
* Lucide React Icons

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
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # Shared React components (PortalLayout, etc.)
│   │   ├── context/            # Auth and Theme React Contexts
│   │   ├── pages/              # Frontend pages (Dashboard, ProjectWorkspace, Login, etc.)
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend Node.js / Express application
│   ├── src/
│   │   ├── config/             # DB, Mailer, and Cloudinary configurations
│   │   ├── controllers/        # Business logic handlers
│   │   ├── middlewares/        # Auth & Upload middlewares
│   │   ├── models/             # Mongoose schemas (User, Project, Paper, Note, Comment, ProgressLog, Invitation)
│   │   └── routes/             # Express API route endpoints
│   ├── tests/                  # Integration tests and utility scripts
│   ├── server.js               # Backend entry point
│   ├── package.json
│   └── .env
├── vercel.json                 # Monorepo Vercel deployment configuration
└── README.md
```

### Database Design

* **User**: name, email, password (hashed), role (LEADER, MEMBER, FACULTY)
* **Project**: title, description, leader (Ref: User), faculty (Ref: User), members (Ref: User Array)
* **Paper**: title, authors, year, keywords, projectId (Ref: Project), uploadedBy (Ref: User), pdfUrl
* **Note**: paperId (Ref: Paper), authorId (Ref: User), content
* **Invitation**: email, projectId (Ref: Project), role, token, status (PENDING, ACCEPTED, REJECTED)
* **ProgressLog**: projectId (Ref: Project), userId (Ref: User), description, date
* **Comment**: projectId (Ref: Project), authorId (Ref: User), content

---

## API Endpoints

### Authentication (`/api/auth`)
| Method | Route       | Description                  | Auth Required |
|--------|-------------|------------------------------|---------------|
| POST   | `/register` | Register a new user          | No            |
| POST   | `/login`    | Login and receive JWT token  | No            |
| GET    | `/me`       | Get current user profile     | Yes           |

### Projects (`/api/projects`)
| Method | Route                         | Description                          | Auth Required | Role Required |
|--------|-------------------------------|--------------------------------------|---------------|---------------|
| POST   | `/`                           | Create a new project                 | Yes           | LEADER        |
| GET    | `/`                           | Get all projects for current user    | Yes           | Any           |
| GET    | `/:id`                        | Get a specific project by ID         | Yes           | Any (member)  |
| DELETE | `/:projectId/members/:memberId`| Remove a member from the project     | Yes           | LEADER/FACULTY|

### Invitations (`/api/invitations`)
| Method | Route             | Description                          | Auth Required | Role Required |
|--------|-------------------|--------------------------------------|---------------|---------------|
| POST   | `/`               | Send project invitation email        | Yes           | LEADER        |
| POST   | `/accept`         | Accept project invitation            | Yes           | Any           |
| GET    | `/verify/:token`  | Verify invitation token status       | No            | Any           |

### Papers (`/api/papers`)
| Method | Route                 | Description                          | Auth Required |
|--------|-----------------------|--------------------------------------|---------------|
| POST   | `/`                   | Upload a new PDF paper to project    | Yes           |
| GET    | `/project/:projectId` | Fetch all papers for a project       | Yes           |
| DELETE | `/:id`                | Delete a paper (and Cloudinary asset)| Yes           |

### Paper Notes (`/api/notes`)
| Method | Route               | Description                          | Auth Required |
|--------|---------------------|--------------------------------------|---------------|
| POST   | `/`                 | Add note to a paper                  | Yes           |
| GET    | `/paper/:paperId`   | Get all notes for a specific paper   | Yes           |
| PUT    | `/:id`              | Update an existing note (author only)| Yes           |
| DELETE | `/:id`              | Delete a note (author or project lead)| Yes          |

### Progress Logs (`/api/progress`)
| Method | Route                 | Description                          | Auth Required |
|--------|-----------------------|--------------------------------------|---------------|
| POST   | `/`                   | Add a new progress log entry         | Yes           |
| GET    | `/project/:projectId` | Fetch progress logs for a project    | Yes           |

### Project Comments (`/api/comments`)
| Method | Route                 | Description                          | Auth Required |
|--------|-----------------------|--------------------------------------|---------------|
| POST   | `/`                   | Add a new project comment            | Yes           |
| GET    | `/project/:projectId` | Fetch project comments               | Yes           |

### Activity Feed (`/api/activity`)
| Method | Route                 | Description                          | Auth Required |
|--------|-----------------------|--------------------------------------|---------------|
| GET    | `/project/:projectId` | Fetch combined project activity feed | Yes           |

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
   CLIENT_URL=http://localhost:3000

   EMAIL_USER=your_email_address
   EMAIL_PASSWORD=your_email_app_password

   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

3. **Install Dependencies**:
   - Inside the **server** directory:
     ```bash
     cd server
     npm install
     ```
   - Inside the **client** directory:
     ```bash
     cd client
     npm install
     ```

4. **Run the Application locally**:
   - Start the **backend** server:
     ```bash
     cd server
     npm run dev
     ```
   - Start the **frontend** development server:
     ```bash
     cd client
     npm run dev
     ```

---

## Testing & DB Utilities

All integration tests are placed in the `server/tests/` directory. They dynamically resolve server configurations using your `.env` variables.

- **Run all integration tests**:
  Ensure the server is running locally on port 5000, then execute:
  ```bash
  node tests/testProjects.js
  node tests/testInvitations.js
  node tests/testPapers.js
  node tests/testNotes.js
  node tests/testProgress.js
  node tests/testComment.js
  node tests/testActivity.js
  ```

- **Reset/Clean Test Database**:
  To purge all automated test projects, progress logs, comments, and temporary users while keeping base accounts intact:
  ```bash
  node tests/cleanDb.js
  ```
