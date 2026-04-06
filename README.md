# ExamDesk BD — Online Exam System (Server)

The backend API for **ExamDesk BD**, a full-featured online exam platform for Bangladeshi competitive exams (BCS, HSC, Bank). Built with **Node.js** and **Express**, backed by **MongoDB Atlas**, and deployed on **Vercel** as a serverless application.

## 🌐 Live Demo

🔗 **[https://exam-desk-bd.vercel.app/](https://exam-desk-bd.vercel.app/)**

## 🔗 Related Repository

- **Client**: [Exam-system-running-client-side](https://github.com/SadikMR/Exam-system-running-client-side.git)

---

## ✨ Key Features

- **JWT Authentication** — Secure token-based auth for both students and admins
- **Role-Based Access Control** — Separate middleware for admin and user routes
- **Live Exam Engine** — Create, publish, and manage timed live exams with proctoring data
- **Practice Exam System** — BCS, HSC, Bank exam questions with subject-wise & year-wise filtering
- **Exam Submission & Review** — Full submission pipeline with scoring and detailed review
- **Webcam Snapshot Storage** — Stores proctoring snapshots via Cloudinary during live exams
- **Email Services** — OTP verification, password reset, admin invitation, and exam reminders via Nodemailer
- **Scheduled Jobs** — `node-cron` schedulers for demo exam management, practice sessions, and reminder emails
- **Cloudinary Integration** — Profile image and webcam snapshot uploads
- **Leaderboard & Rankings** — Per-exam ranking with cheat score (violation count) tracking

---

## 🛠️ Tech Stack

| Category          | Technology               | Usage                              |
| :---------------- | :----------------------- | :--------------------------------- |
| **Runtime**       | Node.js                  | JavaScript server runtime          |
| **Framework**     | Express.js               | HTTP routing & middleware          |
| **Database**      | MongoDB Atlas, Mongoose  | Data persistence & ODM             |
| **Auth**          | JSON Web Token (JWT)     | Stateless authentication           |
| **Password**      | bcrypt / bcryptjs        | Password hashing                   |
| **Email**         | Nodemailer               | OTP, invitations, reminders        |
| **File Upload**   | Multer, Cloudinary       | Profile images & webcam snapshots  |
| **Scheduler**     | node-cron                | Automated exam & reminder jobs     |
| **Deployment**    | Vercel (serverless)      | Production hosting                 |
| **Dev Tool**      | nodemon                  | Hot-reloading in development       |

---

## 📡 API Routes

### User Auth — `/user`
| Method | Endpoint                        | Description                         |
| :----- | :------------------------------ | :---------------------------------- |
| POST   | `/user/register`                | Register a new student              |
| POST   | `/user/login`                   | Student login, returns JWT          |
| POST   | `/user/forgot-password`         | Send OTP to email for reset         |
| POST   | `/user/verify-otp`              | Verify OTP code                     |
| POST   | `/user/set-new-password`        | Set new password after verification |

### Profile — `/api`
| Method | Endpoint                        | Description                         |
| :----- | :------------------------------ | :---------------------------------- |
| GET    | `/api/profile`                  | Get current user's profile          |
| PUT    | `/api/profile`                  | Update profile details              |
| POST   | `/api/profile/upload-image`     | Upload profile image to Cloudinary  |
| GET    | `/api/user-profile/:userId`     | Get public profile of any user      |

### BCS Questions — `/bcs-questions`
| Method | Endpoint                        | Description                         |
| :----- | :------------------------------ | :---------------------------------- |
| GET    | `/bcs-questions/`               | Get all BCS questions               |
| GET    | `/bcs-questions/subjectwise`    | Get questions filtered by subject   |
| GET    | `/bcs-questions/previous-year`  | Get previous year question sets     |

### HSC Questions — `/hsc-questions`
| Method | Endpoint                        | Description                         |
| :----- | :------------------------------ | :---------------------------------- |
| GET    | `/hsc-questions/`               | Get all HSC questions               |
| GET    | `/hsc-questions/subjectwise`    | Get questions filtered by subject   |
| GET    | `/hsc-questions/previous-year`  | Get previous year question sets     |

### Bank Questions — `/bank-questions`
| Method | Endpoint                        | Description                         |
| :----- | :------------------------------ | :---------------------------------- |
| GET    | `/bank-questions/`              | Get all Bank exam questions         |
| GET    | `/bank-questions/subjectwise`   | Get questions filtered by subject   |
| GET    | `/bank-questions/previous-year` | Get previous year question sets     |

### Live Exam — `/liveExam`
| Method | Endpoint                                 | Description                             |
| :----- | :--------------------------------------- | :-------------------------------------- |
| GET    | `/liveExam/`                             | List all published live exams           |
| POST   | `/liveExam/register`                     | Register student for a live exam        |
| POST   | `/liveExam/submit`                       | Submit live exam answers                |
| GET    | `/liveExam/:examId/ranking`              | Get exam leaderboard                    |
| POST   | `/liveExam/webcam-snapshot`             | Upload proctoring snapshot (Cloudinary) |

### Practice Exam — `/practice-exam`
| Method | Endpoint                                       | Description                              |
| :----- | :--------------------------------------------- | :--------------------------------------- |
| POST   | `/practice-exam/submit`                        | Submit practice exam                     |
| GET    | `/practice-exam/history`                       | Get student's submission history         |
| GET    | `/practice-exam/review/:submissionId`          | Detailed review of a submission          |
| GET    | `/practice-exam/leaderboard/:examId`           | Leaderboard for a practice exam          |

### Admin — `/admin`
| Method | Endpoint                              | Description                          |
| :----- | :------------------------------------ | :----------------------------------- |
| POST   | `/admin/login`                        | Admin / editor login                 |
| POST   | `/admin/register`                     | Admin registration via invite token  |
| POST   | `/admin/invite`                       | Send invitation email to new admin   |
| POST   | `/admin/create-exam`                  | Create a new live exam               |
| GET    | `/admin/exam-history`                 | List all exams with submissions      |
| GET    | `/admin/exam-history/:examId`         | Details of a specific exam           |
| GET    | `/admin/exam-history/:examId/ranking` | Full ranking for an exam             |

---

## 🗃️ Database Models

| Model                        | Description                                         |
| :--------------------------- | :-------------------------------------------------- |
| `User`                       | Student accounts (name, email, hashed password)     |
| `Admin` / `Invitation`       | Admin accounts and invite tokens                    |
| `Verification`               | OTP codes for email/password verification           |
| `LiveExam`                   | Live exam documents (questions, timing, status)     |
| `LiveExamRegistration`       | Student–exam registration records                   |
| `LiveExamSubmission`         | Submitted answers + proctoring violation data       |
| `PracticeExamSubmission`     | Practice mode submissions with score & review data  |
| `BcsQuestions`               | BCS question bank                                   |
| `HscQuestions`               | HSC question bank                                   |
| `BankPreviousYearQuestions`  | Bank exam question bank                             |
| `BcsHistory` / `HscHistory`  | Subject-wise and year-wise attempt history          |
| `ExamReminder`               | Scheduled reminder records                          |

---

## ⚙️ Scheduled Services

| Service                   | File                          | Description                                          |
| :------------------------ | :---------------------------- | :--------------------------------------------------- |
| Demo Exam Creator         | `services/demoExamScheduler`  | Creates a permanent always-available demo live exam  |
| Practice Exam Scheduler   | `services/practiceExamScheduler` | Manages practice exam lifecycle                   |
| Reminder Scheduler        | `services/reminderScheduler`  | Sends email reminders before live exams              |

> **Note:** Schedulers only run in local/traditional server environments. On Vercel (serverless), they are not started.

---

## 🔐 Middleware

| File                          | Purpose                                           |
| :---------------------------- | :------------------------------------------------ |
| `middleware/auth.js`          | Verifies JWT for admin-protected routes           |
| `middleware/userAuthMiddleware.js` | Verifies JWT for student-protected routes    |
| `middleware/optionalAuth.js`  | Attaches user if token present, but doesn't block |

---

## 🚀 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/SadikMR/Exam-system-running-server-side.git
   cd Exam-system-running-server-side
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:

   ```env
   # MongoDB Atlas connection string
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>

   # Server port (local dev)
   SERVER_PORT=5000

   # URLs
   BACKEND_URL=http://localhost:5000
   FRONTEND_URL=http://localhost:5173

   # Email (Nodemailer — use Gmail App Password)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password

   # JWT secret key (use a strong random string)
   JWT_SECRET=your_jwt_secret_key

   # Cloudinary (for image & snapshot uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

   > ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

4. **Start Development Server**

   ```bash
   npm run dev
   ```

   Runs on `http://localhost:5000` with `nodemon` hot-reloading.

5. **Start Production Server**

   ```bash
   npm start
   ```

---

## 📂 Directory Structure

```
server/
├── server.js               # Entry point — Express app, route registration, startup logic
├── vercel.json             # Vercel serverless deployment config
├── config/
│   └── db.js               # MongoDB Atlas connection
├── routes/
│   ├── userRoutes.js       # /user — auth, password reset
│   ├── profileRoutes.js    # /api — profile CRUD & image upload
│   ├── bcsquestions.route.js
│   ├── hscquestions.route.js
│   ├── bankquestions.route.js
│   ├── liveExam.js         # /liveExam — live exam full lifecycle
│   ├── practiceExamSubmission.route.js
│   └── Admin/
│       └── adminRoutes.js  # /admin — exam management, invitations
├── controller/             # Business logic per route
├── models/                 # Mongoose schemas
├── middleware/             # JWT auth guards
├── services/               # node-cron scheduled jobs
├── utils/
│   └── emailService.js     # Nodemailer (OTP, invite, reminder emails)
└── data/
    └── demoExamQuestions.js # Seed data for the permanent demo exam
```

---

## ☁️ Deployment (Vercel)

This server is configured to run as a **Vercel serverless function** via `vercel.json`. The `module.exports = app` at the bottom of `server.js` exports the Express app for Vercel's function handler.

> Scheduled jobs (`node-cron`) and the MongoDB startup connection are **disabled on Vercel** and only run in traditional server environments (e.g., local or a VPS).

**Allowed CORS origins (configured in `server.js`):**
- `http://localhost:5173` (local dev)
- `https://exam-desk-bd.vercel.app` (production)

---

## 📝 License

ISC License.