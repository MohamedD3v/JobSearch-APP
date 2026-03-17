# 🚀 FLIPRIS - Advanced Job Search System

FLIPRIS is a comprehensive, professional Job Search platform built with **NestJS**. It provides a robust ecosystem for job seekers to find opportunities, companies to manage listings, and administrators to oversee the platform via a GraphQL dashboard.

---

## 🛠️ Tech Stack

- **Backend**: [NestJS](https://nestjs.com/) (Node.js framework)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM
- **Real-time**: [Socket.IO](https://socket.io/) for instant messaging
- **Query Language**: [GraphQL](https://graphql.org/) (Apollo Driver) for Admin Dashboard
- **File Management**: [Cloudinary](https://cloudinary.com/) for media & [ExcelJS](https://github.com/exceljs/exceljs) for data export
- **Security**: JWT Authentication, Bcrypt hashing, Helmet, and Rate Limiting

---

## ✨ Key Features

- **🔐 Robust Authentication**: Email & OTP confirmation, Google OAuth integration, and JWT-based session management.
- **🏢 Company Management**: Full CRUD for companies, including logo/cover uploads and HR management.
- **💼 Job Ecosystem**: Advanced job posting, filtering, and application tracking system.
- **💬 Real-time Chat**: Individual messaging system powered by Socket.IO.
- **📊 Admin Dashboard**: High-level data overview using GraphQL for efficient querying.
- **📥 Excel Export**: Generate comprehensive reports of job applications in `.xlsx` format.

---

## 📂 Project Structure

```text
src/
├── DB/                      # Database models and schema definitions
├── common/                  # Shared guards, decorators, filters, and services
│   ├── services/            # Email and Cloudinary integration
│   └── utils/               # Token and general utilities
├── modules/                 # Functional modules
│   ├── Admin/               # GraphQL Resolver and Admin Service
│   ├── Auth/                # Authentication logic (Signup, Signin, OTP)
│   ├── Chat/                # Messaging services
│   ├── Company/             # Company profiles and management
│   ├── Job/                 # Job listings and logic
│   ├── Application/         # Job applications and status tracking
│   ├── Socket/              # Socket.IO Gateway
│   └── User/                # User profile management
├── main.ts                  # Application entry point
└── app.module.ts            # Root module configuration
```

---

## 🚀 Installation & Setup

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd JobSearch
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and configure the variables (refer to `.env.example`):

   ```env
   PORT=3000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   ACCESS_TOKEN_SECRET=your_access_secret
   REFRESH_TOKEN_SECRET=your_refresh_secret
   CLOUDINARY_CLOUD_NAME=name
   CLOUDINARY_API_KEY=key
   CLOUDINARY_API_SECRET=secret
   EMAIL=your_email
   PASS=your_email_password
   ```

4. **Run the application**:

   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run start:prod
   ```

---

## 📖 API Documentation

### 🔌 REST Endpoints

| Category    | Method  | Endpoint                          | Description                   |
### 🔌 REST Endpoints

#### 🔐 Authentication
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | Register a new user account | Public |
| `POST` | `/auth/confirm-otp` | Verify email address via OTP | Public |
| `POST` | `/auth/signin` | Authenticate and receive tokens | Public |
| `POST` | `/auth/forget-password` | Trigger password reset OTP | Public |
| `POST` | `/auth/reset-password` | Reset password using OTP | Public |
| `POST` | `/auth/refresh-token` | Obtain new access token | Public |
| `POST` | `/auth/resend-otp` | Resend verification OTP | Public |
| `PUT` | `/auth/update-password` | Update account password | User |

#### 👤 User Profile
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/user/profile` | Get currently logged-in user profile | User |
| `PATCH` | `/user/profile` | Update profile information | User |
| `GET` | `/user/profile/:id` | Get public profile of another user | Public |
| `DELETE` | `/user/account` | Soft delete own account | User |
| `POST` | `/user/profile-pic` | Upload profile picture | User |
| `DELETE` | `/user/profile-pic` | Remove profile picture | User |
| `POST` | `/user/cover-pic` | Upload cover picture | User |
| `DELETE` | `/user/cover-pic` | Remove cover picture | User |

#### 🏢 Company Management
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/company` | Register a new company | User |
| `GET` | `/company/search` | Search companies by name | Public |
| `GET` | `/company/:id` | Get company details & job list | Public |
| `PATCH` | `/company/:id` | Update company information | Owner |
| `DELETE` | `/company/:id` | Soft delete company | Owner/Admin |
| `POST` | `/company/:id/logo` | Upload company logo | Owner |
| `DELETE` | `/company/:id/logo` | Remove company logo | Owner |
| `POST` | `/company/:id/cover` | Upload company cover image | Owner |
| `DELETE` | `/company/:id/cover` | Remove company cover image | Owner |

#### 💼 Job Logic
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/jobs` | Post a new job listing | Owner/HR |
| `GET` | `/jobs` | Get all jobs with filters | Public |
| `PATCH` | `/jobs/:id` | Update job details | Owner |
| `DELETE` | `/jobs/:id` | Remove a job listing | Owner |
| `GET` | `/jobs/company/:companyId` | Get all jobs for a company | Public |
| `GET` | `/jobs/company/:companyId/:jobId` | Get specific job details | Public |

#### 📩 Applications
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/jobs/:jobId/apply` | Apply to a job with CV upload | User |
| `GET` | `/jobs/:jobId/applications` | View applicants for a job | Owner/HR |
| `PATCH` | `/jobs/applications/:appId/status` | Accept/Reject an application | Owner/HR |
| `GET` | `/jobs/applications/excel-export` | **Bonus:** Export apps to CSV | Public |

#### 🛡️ Admin Actions
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `PATCH` | `/admin/users/:id/ban` | Toggle ban status for a user | Admin |
| `PATCH` | `/admin/companies/:id/ban` | Toggle ban status for a company | Admin |
| `PATCH` | `/admin/companies/:id/approve` | Approve a company profile | Admin |

#### 💬 Chat
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/chat/:userId` | Get chat history with a user | User |

### 📊 GraphQL (Admin Dashboard)

Access the GraphQL playground at `/graphql`.

**Query: Get Dashboard Overview**

```graphql
query {
  getDashboardData {
    users {
      _id
      firstName
      email
      bannedAt
    }
    companies {
      _id
      companyName
      isApproved
    }
  }
}
```

### ⚡ Socket.IO Events

**Namespace**: `/` (Default)

| Event            | Direction        | Payload                            | Description                 |
| :--------------- | :--------------- | :--------------------------------- | :-------------------------- |
| `sendMessage`    | Client -> Server | `{ receiverId, message }`          | Send a real-time message    |
| `receiveMessage` | Server -> Client | `{ senderId, message, createdAt }` | Receive an incoming message |
| `newApplication` | Server -> Client | `{ jobTitle, userId }`             | Notification for company HR |

To test the APIs, import the Flipris.postman_collection.json file located in the root folder into your Postman.

---

## 📄 License

This project is [UNLICENSED](LICENSE).
