# 🚗 Car Parking Service Number System (MERN Stack)

A clean, beginner-friendly MERN (MongoDB, Express, React, Node.js) stack project.

---

## 📁 Project Folder Structure

```
car-parking-system/
├── client/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx             # Main homepage with buttons & views
│   │   ├── App.css             # Simple styling
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Global layout styles
│   ├── index.html              # HTML template
│   ├── package.json            # Client dependencies
│   └── vite.config.js          # Vite config
│
├── server/                     # Backend (Node.js + Express + MongoDB)
│   ├── config/
│   │   └── db.js               # MongoDB connection using Mongoose
│   ├── models/
│   │   └── ParkingTicket.js    # Schema for Parking Service Numbers
│   ├── routes/
│   │   └── parkingRoutes.js    # API endpoints (Book, Check, Admin, Exit)
│   ├── server.js               # Express server setup & port listener
│   ├── .env                    # PORT and MONGO_URI
│   └── package.json            # Server dependencies
│
└── README.md                   # This instruction guide
```

---

## 🚀 How to Run the Project (Step-by-Step)

You need **two terminal windows**: one for the backend server and one for the frontend client.

### Step 1: Start MongoDB (If running locally)
Make sure your MongoDB server is running (e.g. MongoDB Compass or MongoDB Community Service on `mongodb://127.0.0.1:27017`).
> *Note: If you use MongoDB Atlas (Cloud), paste your connection string into `server/.env` under `MONGO_URI`.*

---

### Step 2: Run the Backend (Server)

1. Open a new terminal and navigate to the `server` folder:
   ```bash
   cd server
   ```
2. Install backend dependencies (only needed the first time):
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   *(Or run `npm run dev` to start with auto-reload via nodemon)*

✅ You will see:
```
🚀 Server is running on: http://localhost:5000
📡 Health Check endpoint: http://localhost:5000/api/health
[MongoDB] Connected successfully to host: 127.0.0.1
```

---

### Step 3: Run the Frontend (Client)

1. Open a second terminal and navigate to the `client` folder:
   ```bash
   cd client
   ```
2. Install frontend dependencies (only needed the first time):
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```
4. Open your browser and visit:
   ```
   http://localhost:5173
   ```

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Checks if the backend server is online |
| `POST` | `/api/parking/book` | Books a spot and generates a service token number |
| `GET` | `/api/parking/check/:query` | Looks up status by Service Number or Vehicle Plate |
| `GET` | `/api/parking/all` | Lists all parked and completed tickets (Admin) |
| `PUT` | `/api/parking/exit/:ticketNumber` | Marks a vehicle as exited and frees the slot |

---

## 💡 Key Files Explained for Beginners

1. **`server/server.js`**: The starting point of the backend. It sets up Express, enables CORS (so React can make requests), connects to MongoDB, and registers API routes.
2. **`server/config/db.js`**: Connects Node.js to MongoDB using Mongoose.
3. **`server/models/ParkingTicket.js`**: Defines the data structure (Schema) for each parking ticket in the database.
4. **`server/routes/parkingRoutes.js`**: Contains the route logic (functions that receive HTTP requests from React and talk to MongoDB).
5. **`client/src/App.jsx`**: The main React component that handles the UI, form inputs, button clicks, and makes `fetch()` calls to the Express backend.
6. **`client/src/App.css`**: Contains clean, readable CSS styles.
