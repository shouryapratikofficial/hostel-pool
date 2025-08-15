# Hostel-Pool: Financial Management for Shared Living

<img width="1920" height="1080" alt="Screenshot 2025-08-13 134458" src="https://github.com/user-attachments/assets/174a0182-1253-4e24-80d5-636dca9add00" />


Hostel-Pool is a full-stack MERN application designed to simplify financial management within a hostel or shared living environment. It provides a centralized platform for members to pool funds, request loans, track contributions, and automatically distribute profits generated from loan interest.

## The Problem

In many shared living situations, managing a collective fund for expenses or small loans is done informally through messaging apps or spreadsheets. This process is often prone to errors, lacks transparency, and makes tracking contributions and calculating interest cumbersome. Hostel-Pool was built to solve this by providing a secure, transparent, and automated solution.

## Features

* **User Authentication:** Secure registration and login system using JWT (JSON Web Tokens).
* **Role-Based Access Control:** Distinction between regular users and an admin with special privileges.
* **Fund Management:** Users can contribute to and withdraw from the central pool fund.
* **Loan System:** Members can request loans from the pool, which are then approved or rejected by the admin.
* **Automated Profit Distribution:** A scheduled cron job automatically calculates and distributes profits from loan interest to all members based on their contribution.
* **Notifications:** Users receive notifications for key events like loan status changes and profit distributions.
* **Admin Dashboard:** A comprehensive dashboard for the admin to manage users, loans, and system settings.

## Tech Stack

**Frontend:**
* React.js
* React Router
* Axios
* Tailwind CSS

**Backend:**
* Node.js
* Express.js
* MongoDB (with Mongoose)
* JWT for Authentication
* Bcrypt.js for Password Hashing
* `node-cron` for Scheduled Tasks

## Getting Started

### Prerequisites

* Node.js (v18.x or higher)
* npm
* MongoDB (local instance or a cloud service like MongoDB Atlas)

### Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/shouryapratikofficial/hostel-pool.git](https://github.com/shouryapratikofficial/hostel-pool.git)
    cd hostel-pool
    ```

2.  **Setup the Backend:**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `/backend` directory and add the following variables:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_jwt_key
    ```
    Start the backend server:
    ```bash
    npm run dev
    ```

3.  **Setup the Frontend:**
    ```bash
    cd ../frontend
    npm install
    ```
    Start the frontend development server:
    ```bash
    npm run dev
    ```

The application should now be running on `http://localhost:5173`.
