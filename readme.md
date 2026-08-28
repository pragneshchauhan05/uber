# 🚕 Uber Clone — Full-Stack Web Application & PWA

A feature-rich, high-performance, real-time **Uber Clone** application built with the **MERN** stack (MongoDB, Express.js, React.js, Node.js), Socket.io, TailwindCSS, GSAP, and Google Maps API with OpenStreetMap / Leaflet fallbacks.

---

## 🌟 Key Features Overview

### 👤 User & Captain Authentication
- **Dual Portal Authentication**: Separate registration and login workflows for Riders (Users) and Captains (Drivers).
- **Session & Cookie Persistence**: HTTP-only JWT cookies combined with `sessionStorage` route persistence (`lastPath`) so users stay logged in across page refreshes.
- **Real-Time Input Validation**:
  - **Email Format**: Regex validation for valid email address formatting (`name@example.com`).
  - **Password**: Enforces minimum 6 characters.
  - **First Name**: Minimum 3 characters requirement.
  - **Vehicle Color**: Letters-only validation (e.g. `Black`, `White`).
  - **License Plate**: Strict Indian vehicle registration format (`GJ 05 AH 5358`).
  - **Vehicle Seats**: Maximum capacity limit of 6 passengers with auto-preset capacity per vehicle type (Motorcycle: 1, Auto: 3, Car: 4).
- **Inline Error Feedback**: Red input highlight borders, inline validation notes, and styled server error banners.

---

### 🗺️ Live Mapping & Fast Location Services
- **Dual Map Engine**:
  - Primary: Google Maps 2D JavaScript API.
  - Fallback: Auto-switches to **OpenStreetMap + Leaflet.js** if Google Maps quota/API key limits are reached.
- **Ultra-Fast Parallel Fare & Distance Engine**:
  - Uses `Promise.all` parallel geocoding and 1000ms timeouts for sub-200ms fare responses.
  - In-memory LRU caching (`distanceCache` & `geocodeCache`) for repeat searches.
- **Indian Rupee Formatting**:
  - All ride fares and driver earnings formatted using Indian locale numbers (e.g. **`₹2,000`**).

---

### ⚡ Real-Time Socket.io Integration
- **Live Location Tracking**: Captains stream current GPS coordinates (`update-location-captain`) to backend every 10s.
- **Trip Lifecycle Events**:
  - `ride_request`: Nearby captains receive instant ride popup cards.
  - `ride-confirmed`: User gets matched with driver details & OTP.
  - `ride-started`: OTP verification triggers live trip screen (`/riding`).
  - `ride-ended`: Forward user back to clean `/home` screen, closing all panels.
  - `ride-cancelled`: Resets state and closes all panels across rider & captain interfaces.

---

### 💰 Dynamic Captain Earnings Management
- **Automated Earnings Accumulation**: When a captain completes a trip (`POST /rides/end-ride`), the trip fare is atomically calculated and saved to MongoDB.
- **Dynamic Database Aggregation**: Captain homepage dynamically queries completed rides (`status: "completed"`) and updates the **"Earned Today"** header in real-time.

---

### 🛣️ Phase 1: Captain Planned Route Creation (Carpooling)
- **Route Publishing**: Captains can create and publish scheduled planned routes.
- **Location Autocomplete**: Select Start Location and Destination using live Google Places / Nominatim search.
- **Schedule & Seats**: Select Departure Date, Departure Time, and Available Seats (1-6).
- **Map Polyline Preview**: Renders Start & Destination markers connected with a dashed Polyline route line.
- **Route Manager**: View and delete published active routes (`GET /api/routes/my-routes` and `DELETE /api/routes/:id`).

---

## 🏗️ Technology Stack

### **Frontend**
- **Framework**: React.js (Vite)
- **Styling**: Vanilla CSS, TailwindCSS
- **Animations**: GSAP (GPU transformed `y: "0%"`, `y: "100%"`)
- **Maps**: `@react-google-maps/api`, `Leaflet.js` & OpenStreetMap
- **Icons**: RemixIcon
- **PWA**: `vite-plugin-pwa` with custom mobile/desktop install prompt

### **Backend**
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose Schema validation
- **Real-time Protocol**: Socket.io
- **Security**: `bcryptjs` password hashing, `jsonwebtoken` (JWT), `cookie-parser`, `express-validator`

---

## 📂 Project Architecture

```text
Uber Clone/
├── backend/
│   ├── config/
│   ├── controllers/
│   │   ├── captain.controller.js
│   │   ├── captainRoute.controller.js
│   │   ├── ride.controller.js
│   │   └── user.controller.js
│   ├── db/
│   │   └── db.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── blackListToken.js
│   │   ├── captain.model.js
│   │   ├── captainRoute.model.js
│   │   ├── ride.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── captain.routes.js
│   │   ├── captainRoute.routes.js
│   │   ├── maps.routes.js
│   │   ├── ride.routes.js
│   │   └── user.routes.js
│   ├── services/
│   │   ├── captain.service.js
│   │   ├── maps.service.js
│   │   ├── ride.service.js
│   │   └── user.service.js
│   ├── app.js
│   ├── server.js
│   └── socket.js
└── frontend/
    ├── public/
    │   ├── pwa-192x192.png
    │   ├── pwa-512x512.png
    │   └── uber.png
    ├── src/
    │   ├── componets/
    │   │   ├── CaptainDetails.jsx
    │   │   ├── ConfirmedRide.jsx
    │   │   ├── ConfirmRidePop.jsx
    │   │   ├── FinishRide.jsx
    │   │   ├── LiveTraking.jsx
    │   │   ├── LocationSearchPanel.jsx
    │   │   ├── LookingForDriver.jsx
    │   │   ├── PWAInstallPrompt.jsx
    │   │   ├── RidePopUp.jsx
    │   │   ├── VehiclePanel.jsx
    │   │   └── WaitingForDriver.jsx
    │   ├── Context/
    │   │   ├── CaptainContext.jsx
    │   │   ├── SocketContext.jsx
    │   │   └── UserContext.jsx
    │   ├── pages/
    │   │   ├── CaptainHome.jsx
    │   │   ├── CaptainLogin.jsx
    │   │   ├── CaptainLogout.jsx
    │   │   ├── CaptainProtectWrapper.jsx
    │   │   ├── CaptainRiding.jsx
    │   │   ├── CaptainSignup.jsx
    │   │   ├── CreateRoute.jsx
    │   │   ├── Home.jsx
    │   │   ├── Riding.jsx
    │   │   ├── Start.jsx
    │   │   ├── UserLogin.jsx
    │   │   ├── UserLogout.jsx
    │   │   └── UserSignup.jsx
    │   ├── App.jsx
    │   ├── config.js
    │   └── main.jsx
    └── vite.config.js
```

---

## 📡 Complete API Reference

### 👤 User Endpoints (`/users`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/users/register` | Register a new user | No |
| `POST` | `/users/login` | Authenticate user & issue token/cookie | No |
| `GET` | `/users/profile` | Get current user profile | Yes (User Token) |
| `GET` | `/users/logout` | Revoke token and clear session | Yes (User Token) |

---

### 👨‍✈️ Captain Endpoints (`/captains`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/captains/register` | Register new captain with vehicle details | No |
| `POST` | `/captains/login` | Authenticate captain & issue token/cookie | No |
| `GET` | `/captains/profile` | Get captain profile & dynamic today earnings | Yes (Captain Token) |
| `POST` | `/captains/logout` | Revoke captain token | Yes (Captain Token) |

---

### 🚖 Ride Endpoints (`/rides`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/rides/create` | Create a new ride request | Yes (User Token) |
| `GET` | `/rides/get-fare` | Calculate instant fare for pickup & destination | Yes (User Token) |
| `POST` | `/rides/confirm` | Captain accepts a ride request | Yes (Captain Token) |
| `GET` | `/rides/start-ride` | Start ride with OTP verification | Yes (Captain Token) |
| `POST` | `/rides/end-ride` | Complete ride & update captain earnings | Yes (Captain Token) |
| `POST` | `/rides/cancel-ride` | Cancel ongoing or pending ride | Yes |

---

### 🗺️ Maps Endpoints (`/maps`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/maps/get-coordinates` | Get `{ lat, lng }` for an address string | Yes |
| `GET` | `/maps/get-distance-time` | Get distance and travel duration between locations | Yes |
| `GET` | `/maps/get-suggestion` | Autocomplete location search suggestions | Yes |

---

### 🛣️ Captain Route Endpoints (`/api/routes` or `/routes`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/routes` | Create and publish a planned captain route | Yes (Captain Token) |
| `GET` | `/api/routes/my-routes` | Fetch all active planned routes by logged-in captain | Yes (Captain Token) |
| `DELETE` | `/api/routes/:id` | Delete/Cancel a published planned route | Yes (Captain Token) |

---

## 💻 Installation & Setup Guide

### Prerequisites
- Node.js (`v18+`)
- MongoDB (Local instance or MongoDB Atlas cluster)
- Google Maps API Key (with Maps JavaScript API & Geocoding enabled)

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone https://github.com/pragneshchauhan05/uber.git
cd "Uber Clone"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---


### 3. Run Locally

```bash
# Start Backend server (from backend directory)
cd backend
npm run dev

# Start Frontend Vite server (from frontend directory)
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---


