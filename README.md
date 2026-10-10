# CommonRoom — Full-Stack Team Collaboration Platform

CommonRoom is a production-grade team collaboration and messaging web application designed for modern high-performance engineering and product teams. It features real-time team communication, channels, direct messaging, message reactions, threads/replies, pinned items, presence tracking, and workspace management.

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       CommonRoom UI                         │
│         React 19 + JSX + Tailwind CSS + Lucide Icons        │
│              (Vite Dev Server: Port 3000 / 5173)            │
└──────────────┬──────────────────────────────▲───────────────┘
               │                              │
               │ HTTP / JSON REST APIs        │ Real-time Events
               │ Bearer JWT Authorization     │ Event Listeners
               ▼                              │
┌─────────────────────────────────────────────┴───────────────┐
│               Spring Boot 3.2.3 Backend                     │
│                        (Java 17)                            │
│  ├── Security: Spring Security + JWT Filter + BCrypt        │
│  ├── Controllers: Auth, Users, Workspaces, Chat, Messages   │
│  ├── Services: RBAC Validation, Permissions, Notifications  │
│  └── Repositories: Google Cloud Firestore Java SDK (Async)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Google Cloud Firestore                      │
│             (Port 8085 Local Emulator / GCP)                │
│  ├── users              ├── workspaces                      │
│  ├── workspaceMembers   ├── conversations                   │
│  ├── messages           └── notifications                   │
│  Security Rules: enforced by firebase/firestore.rules       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

* **Frontend**:
  * React 19 with JavaScript and JSX (`.jsx` components, `.js` utilities).
  * Tailwind CSS v4 styling with refined typography and zero AI-slop design.
  * Lucide React icons.
  * React Router v7 for client-side navigation.
  * Dual-mode client API adapter: Seamlessly runs directly in-browser using full persistent Firestore emulation or connects directly to the Java Spring Boot REST server.
* **Backend**:
  * Java 17.
  * Spring Boot 3.2.3 (`spring-boot-starter-web`, `spring-boot-starter-security`, `spring-boot-starter-validation`).
  * Google Firebase Admin SDK (`firebase-admin: 9.3.0`) for Cloud Firestore integration.
  * JJWT (`jjwt-api: 0.12.5`) for stateless HMAC-SHA256 token issuance and validation.
  * BCrypt password hashing with adaptive salted rounds.
* **Database & Security**:
  * Firebase Cloud Firestore with local Firebase Emulator configuration.
  * Strict Firestore Security Rules in `firebase/firestore.rules`.
  * Composite query indices in `firebase/firestore.indexes.json`.

---

## 3. Project Directory Structure

```
commonroom/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/commonroom/chat/
│   │   │   │   ├── config/          # FirebaseConfig, SecurityConfig, CorsConfig
│   │   │   │   ├── controller/      # Auth, User, Workspace, Conv, Message, Notif
│   │   │   │   ├── dto/             # Requests, Responses, ApiResponse
│   │   │   │   ├── exception/       # GlobalExceptionHandler, Custom exceptions
│   │   │   │   ├── model/           # User, Workspace, Conversation, Message
│   │   │   │   ├── repository/      # Firestore async CRUD repositories
│   │   │   │   ├── security/        # JwtTokenProvider, JwtAuthFilter, UserPrincipal
│   │   │   │   ├── service/         # Business logic, RBAC, message management
│   │   │   │   └── ChatApplication.java
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   └── test/
│   │       └── java/com/commonroom/chat/
│   │           ├── ChatApplicationTests.java
│   │           ├── controller/AuthControllerTest.java
│   │           └── service/MessageServiceTest.java
│   ├── pom.xml
│   └── .env.example
├── firebase/
│   ├── firebase.json
│   ├── firestore.rules
│   └── firestore.indexes.json
├── src/
│   ├── api/
│   │   ├── client.js                # Unified REST API client
│   │   └── localBackendEngine.js    # In-browser Firestore persistence engine
│   ├── components/
│   │   ├── chat/                    # ChatHeader, MessageList, MessageBubble, Composer
│   │   ├── common/                  # UserAvatar, Toast, LoadingSpinner, ConfirmDialog
│   │   ├── layout/                  # AppLayout, TopHeader, Sidebar
│   │   └── modals/                  # CreateGroup, CreateWorkspace, Search, Profile, Inspector
│   ├── context/                     # Auth, Chat, Workspace, Notification, Theme, Toast
│   ├── pages/                       # WorkspacePage, LoginPage, RegisterPage, ForgotPassword
│   ├── routes/                      # AppRoutes (Protected routing)
│   ├── utils/                       # dateUtils, stringUtils
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 4. Local Installation and Running Instructions (Windows PowerShell)

### Prerequisites

1. **Java 17 JDK**: Download and install Eclipse Temurin 17 or Oracle JDK 17.
   ```powershell
   java -version
   ```
2. **Apache Maven**:
   ```powershell
   mvn -version
   ```
3. **Node.js (v18+) & npm**:
   ```powershell
   node -v
   npm.cmd -v
   ```
4. **Firebase CLI**:
   ```powershell
   npm.cmd install -g firebase-tools
   firebase --version
   ```

---

### Step-by-Step Launch Guide

#### Step 1: Start the Firebase Firestore Emulator (Terminal 1)

In PowerShell:
```powershell
cd firebase
firebase emulators:start --only firestore
```
* The Firestore Emulator will listen on `127.0.0.1:8085`.
* The Emulator UI will be accessible at `http://127.0.0.1:4000`.

#### Step 2: Build & Start the Java Spring Boot Backend (Terminal 2)

In a separate PowerShell window:
```powershell
cd backend
$env:FIRESTORE_EMULATOR_HOST="localhost:8085"
$env:FIREBASE_EMULATOR_ENABLED="true"
mvn clean spring-boot:run
```
* Spring Boot starts on `http://localhost:8080`.
* The server automatically discovers the Firestore Emulator on port 8085.

#### Step 3: Install & Start the React Frontend (Terminal 3)

In a third PowerShell window:
```powershell
npm.cmd install
npm.cmd run dev
```
* The Vite dev server will launch at `http://localhost:3000` (or `http://localhost:5173`).
* Open your browser and navigate to the application URL.

---

## 5. Security Architecture & Controls

* **Stateless JWT Interceptor**: Every protected endpoint requires `Authorization: Bearer <token>`. The `JwtAuthenticationFilter` validates the signature using HMAC-SHA256, extracts the subject UID, and attaches `UserPrincipal` to the Spring Security Context.
* **Server-Side Authorization (RBAC)**:
  * Users can only list or send messages to conversations where their UID exists in `conversation.participantIds`.
  * Message editing and deletion is restricted strictly to the original `senderId`.
  * Group settings and channel member modification are restricted to the group creator/admins.
* **BCrypt Hashing**: Passwords are never stored in plaintext. They are hashed using BCrypt prior to persistence in Firestore.
* **Firestore Security Rules**: Client SDK access enforces authentication and membership invariants (`resource.data.participantIds` contains `request.auth.uid`).

---

## 6. REST API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Authenticate credentials and receive JWT |
| `POST` | `/api/auth/logout` | Set user status to OFFLINE |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `POST` | `/api/auth/forgot-password` | Dispatches reset instructions |
| `GET` | `/api/users/search?q={query}` | Search team members by name or email |
| `PUT` | `/api/users/me` | Update display name, status, and avatar |
| `GET` | `/api/workspaces` | List current user workspaces |
| `POST` | `/api/workspaces` | Create new workspace (creator is OWNER) |
| `GET` | `/api/workspaces/{id}/members` | List members of a workspace |
| `POST` | `/api/workspaces/{id}/members` | Add user to workspace |
| `GET` | `/api/conversations?workspaceId={id}` | List channels and DMs |
| `POST` | `/api/conversations` | Create public channel or start 1-on-1 DM |
| `GET` | `/api/conversations/{id}/messages` | Get chronological message history |
| `POST` | `/api/conversations/{id}/messages` | Post message (supports thread replies) |
| `PUT` | `/api/conversations/{id}/messages/{id}` | Edit message text |
| `DELETE` | `/api/conversations/{id}/messages/{id}` | Soft-delete message |
| `POST` | `/api/conversations/{id}/messages/{id}/reactions` | Toggle emoji reaction |
| `POST` | `/api/conversations/{id}/messages/{id}/pin` | Toggle pin on message |
| `GET` | `/api/notifications` | Fetch unread and read notifications |
| `PATCH`| `/api/notifications/{id}/read` | Mark notification as read |

---

## 7. Running Tests

### Backend Unit & Integration Tests (Java / JUnit 5)
```powershell
cd backend
mvn test
```

### Frontend Build Verification
```powershell
npm.cmd run build
```

---

## 8. Development & Standalone Execution

When running inside the Google AI Studio container sandbox, the in-browser Firestore engine is automatically active, enabling full end-to-end testing of every collaboration feature (instant messaging, emoji reactions, pin toggles, channel creation, user search, profile modifications, notifications, and dark theme) without requiring external processes. You can test and toggle the connection anytime using the **Backend Inspector** in the top navigation bar.
