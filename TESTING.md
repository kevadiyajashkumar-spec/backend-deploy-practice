# Backend Testing Guide

## Prerequisites
- Backend running on http://localhost:5000
- MySQL database setup with sample data
- npm dependencies installed

---

## 1. TEST REGISTER ENDPOINT
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"testpass123"}'
```

**Expected Response (201):**
```json
{
  "message": "User registered successfully",
  "userId": 3
}
```

---

## 2. TEST LOGIN ENDPOINT
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Expected Response (200):**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com"
  }
}
```

**IMPORTANT:** Copy the `accessToken` value. You'll need it for protected routes.

---

## 3. TEST CREATE TASK ENDPOINT
Replace `YOUR_ACCESS_TOKEN` with the token from login.

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"inputText":"Hello world this is a test for processing"}'
```

**Expected Response (201):**
```json
{
  "message": "Task created successfully",
  "task": {
    "id": 5,
    "userId": 1,
    "inputText": "Hello world this is a test for processing",
    "status": "pending",
    "progress": 0,
    "createdAt": "2025-12-10T14:30:00.000Z"
  }
}
```

---

## 4. TEST GET ALL TASKS
```bash
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200):**
```json
{
  "message": "Tasks retrieved successfully",
  "tasks": [
    {
      "id": 1,
      "inputText": "Hello world this is a test task for text processing",
      "status": "completed",
      "progress": 100,
      "createdAt": "2025-12-10T13:00:00.000Z"
    },
    {
      "id": 5,
      "inputText": "Hello world this is a test for processing",
      "status": "pending",
      "progress": 0,
      "createdAt": "2025-12-10T14:30:00.000Z"
    }
  ]
}
```

---

## 5. TEST GET TASK BY ID
```bash
curl -X GET http://localhost:5000/api/tasks/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200):**
```json
{
  "message": "Task retrieved successfully",
  "task": {
    "id": 1,
    "userId": 1,
    "inputText": "Hello world this is a test task for text processing",
    "status": "completed",
    "progress": 100,
    "result": "{\"wordFrequency\": {...}, \"charFrequency\": {...}}",
    "createdAt": "2025-12-10T13:00:00.000Z",
    "updatedAt": "2025-12-10T13:15:00.000Z"
  }
}
```

---

## 6. TEST UPDATE TASK RESULT (from Web Worker)
```bash
curl -X PUT http://localhost:5000/api/tasks/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"result":"{\"wordFrequency\":{\"hello\":1,\"world\":1},\"totalWords\":2}","status":"completed","progress":100}'
```

**Expected Response (200):**
```json
{
  "message": "Task updated successfully",
  "task": {
    "id": 5,
    "userId": 1,
    "inputText": "Hello world this is a test for processing",
    "status": "completed",
    "progress": 100,
    "result": "{\"wordFrequency\":{\"hello\":1,\"world\":1},\"totalWords\":2}",
    "createdAt": "2025-12-10T14:30:00.000Z",
    "updatedAt": "2025-12-10T14:35:00.000Z"
  }
}
```

---

## 7. TEST REFRESH TOKEN (using cookies)
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Cookie: refreshToken=YOUR_REFRESH_TOKEN"
```

**Expected Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 8. TEST LOGOUT
```bash
curl -X POST http://localhost:5000/api/auth/logout
```

**Expected Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## Error Cases

### Missing Token
```bash
curl -X GET http://localhost:5000/api/tasks
```
**Response (401):**
```json
{"error": "No token provided"}
```

### Invalid Email/Password
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@example.com","password":"wrong"}'
```
**Response (401):**
```json
{"error": "Invalid email or password"}
```

### Unauthorized Task Access
```bash
curl -X GET http://localhost:5000/api/tasks/999 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Response (404):**
```json
{"error": "Task not found or unauthorized"}
```

---

## Running the Server

1. Make sure MySQL is running
2. Update `.env` with correct DB credentials
3. Run:
```bash
npm run dev
```

You should see:
```
✅ Database connection successful
✅ Server running on http://localhost:5000
```
