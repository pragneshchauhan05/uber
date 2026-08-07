# Uber Clone Backend Documentation

This document provides complete documentation for the API endpoints available in the Uber Clone Backend.

---

## 📌 User Authentication Endpoints

### 1. Register User

Register a new user in the system, hash the password, save user details to MongoDB, and return a JWT authentication token.

- **Endpoint:** `/users/register`
- **HTTP Method:** `POST`
- **Content-Type:** `application/json`

---

#### 📥 Request Headers

| Header         | Type   | Value              | Required |
| :------------- | :----- | :----------------- | :------- |
| `Content-Type` | String | `application/json` | Yes      |

---

#### 📝 Request Body Requirements

The request body must be sent as a JSON object with the following fields:

| Field                | Type   | Required | Constraints / Description                      |
| :------------------- | :----- | :------- | :--------------------------------------------- |
| `fullname.firstname` | String | **Yes**  | Minimum 3 characters long.                     |
| `fullname.lastname`  | String | No       | Minimum 3 characters long (optional).          |
| `email`              | String | **Yes**  | Must be a valid email address. Must be unique. |
| `password`           | String | **Yes**  | Minimum 6 characters long.                     |

##### Example Request Body:

```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "password123"
}
```

---

#### 📤 Response & Status Codes

#### 1️⃣ `201 Created` — Registration Successful

Returned when the user is successfully created in the database and a JWT authentication token is generated.

##### Example Response:

```json
{
  "user": {
    "_id": "66b1a2345c67890123456789",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "socketId": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmIxYTIzNDVjNjc4OTAxMjM0NTY3ODkiLCJpYXQiOjE3MjI5NDU0MDB9.signature"
}
```

---

#### 2️⃣ `400 Bad Request` — Validation Failed or User Already Exists

Returned if input validation fails (e.g. invalid email format, short firstname/password) or if an account with the specified email address already exists.

##### Example Response (Validation Errors):

```json
{
  "errors": [
    {
      "type": "field",
      "value": "jo",
      "msg": "First name must be at least 3 characters long",
      "path": "fullname.firstname",
      "location": "body"
    },
    {
      "type": "field",
      "value": "invalid-email",
      "msg": "Invalid email address",
      "path": "email",
      "location": "body"
    },
    {
      "type": "field",
      "value": "123",
      "msg": "Password must be at least 6 characters long",
      "path": "password",
      "location": "body"
    }
  ]
}
```

##### Example Response (User Already Exists):

```json
{
  "message": "User already exists with this email"
}
```

---

#### 3️⃣ `500 Internal Server Error` — Server / Database Error

Returned when an unexpected error occurs on the server or database connection fails.

##### Example Response:

```json
{
  "message": "Error connecting to database"
}
```

---

### 2. Login User

Authenticate an existing user using email and password. Returns a JWT authentication token on success.

- **Endpoint:** `/users/login`
- **HTTP Method:** `POST`
- **Content-Type:** `application/json`

---

#### 📥 Request Headers

| Header         | Type   | Value              | Required |
| :------------- | :----- | :----------------- | :------- |
| `Content-Type` | String | `application/json` | Yes      |

---

#### 📝 Request Body Requirements

The request body must be sent as a JSON object with the following fields:

| Field      | Type   | Required | Constraints / Description      |
| :--------- | :----- | :------- | :----------------------------- |
| `email`    | String | **Yes**  | Must be a valid email address. |
| `password` | String | **Yes**  | Minimum 6 characters long.     |

##### Example Request Body:

```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

---

#### 📤 Response & Status Codes

#### 1️⃣ `200 OK` — Login Successful

Returned when credentials are valid and a JWT token is generated.

##### Example Response:

```json
{
  "user": {
    "_id": "66b1a2345c67890123456789",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "socketId": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmIxYTIzNDVjNjc4OTAxMjM0NTY3ODkiLCJpYXQiOjE3MjI5NDU0MDB9.signature"
}
```

#### 2️⃣ `400 Bad Request` — Validation Failed

Returned if email or password is missing or invalid.

##### Example Response:

```json
{
  "errors": [
    {
      "msg": "Invalid email address",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "Password must be at least 6 characters long",
      "param": "password",
      "location": "body"
    }
  ]
}
```

#### 3️⃣ `401 Unauthorized` — Invalid Credentials

Returned when the email does not exist or the password is incorrect.

##### Example Response:

```json
{
  "message": "Invalid credentials"
}
```

#### 4️⃣ `500 Internal Server Error` — Server / Database Error

Returned when an unexpected server error occurs while processing the login.

##### Example Response:

```json
{
  "message": "Internal server error"
}
```

---

### 3. Get User Profile

Fetch the authenticated user's profile details.

- **Endpoint:** `/users/profile`
- **HTTP Method:** `GET`
- **Authentication:** Required

#### 📥 Request Headers

| Header          | Type   | Value            | Required |
| :-------------- | :----- | :--------------- | :------- |
| `Authorization` | String | `Bearer <token>` | Yes      |

> The token can also be sent in a cookie named `token`.

#### 📤 Response & Status Codes

#### 1️⃣ `200 OK` — Profile Retrieved Successfully

##### Example Response:

```json
{
  "user": {
    "_id": "66b1a2345c67890123456789",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "socketId": null
  }
}
```

#### 2️⃣ `401 Unauthorized` — Invalid or Missing Token

##### Example Response:

```json
{
  "message": "No token provided"
}
```

#### 3️⃣ `404 Not Found` — User Not Found

##### Example Response:

```json
{
  "message": "User not found"
}
```

---

### 4. Logout User

Invalidate the current JWT token so it can no longer be used.

- **Endpoint:** `/users/logout`
- **HTTP Method:** `POST`
- **Authentication:** Recommended via current JWT token

#### 📥 Request Headers

| Header          | Type   | Value            | Required |
| :-------------- | :----- | :--------------- | :------- |
| `Authorization` | String | `Bearer <token>` | Yes      |

> The token can also be sent in a cookie named `token`.

#### 📤 Response & Status Codes

#### 1️⃣ `200 OK` — Logout Successful

##### Example Response:

```json
{
  "message": "Logged out successfully"
}
```

#### 2️⃣ `401 Unauthorized` — Invalid or Missing Token

##### Example Response:

```json
{
  "message": "Invalid token"
}
```
