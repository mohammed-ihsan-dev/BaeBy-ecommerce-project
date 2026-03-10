# 🛠️ Admin Backend Guide: BaeBy eCommerce

Welcome to the **Admin Backend Architecture** documentation for the BaeBy MERN project. This guide explains how the "brain" of our admin system works, from security to data management.

---

## 🚀 1. Project Overview
The **BaeBy Admin Backend** is the command center of our eCommerce application. 
- **What it is:** A Node.js & Express REST API that connects to MongoDB.
- **Goal:** To allow store owners (Admins) to manage products, view customers, track orders, and see business growth statistics.
- **Control:** Secure routes ensure that only users with the `admin` role can access management tools.

---

## 🔐 2. Admin Authentication
Before an admin can do anything, they must be authenticated. We use **JWT (JSON Web Tokens)** for this.

### Login Process
**Endpoint:** `POST /api/admin/login`
1.  Admin enters their email and password.
2.  Backend checks: *Does this email exist? Is the user's role "admin"?*
3.  Password check: Uses `bcrypt` to compare the encrypted password in the database.
4.  If successful, the backend sends back a `jwt_token`.

### Security Layer (Middleware)
We protect our routes using two "checkpoints":
- **`protect` Middleware:** Verifies that the token sent in the request header is valid.
- **`adminOnly` Middleware:** Verifies that the user attached to that token has `role: "admin"`.

**Example Route Protection:**
```javascript
// adminRoutes.js
router.use(protect, adminOnly); // Every route below this needs a valid Admin token
```

---

## 📊 3. Admin Dashboard Statistics
The dashboard gives a quick summary of the business. 

**Endpoint:** `GET /api/admin/stats`
The backend uses fast MongoDB queries to calculate:
- **Total Users:** `User.countDocuments({})`
- **Total Products:** `Product.countDocuments({})`
- **Total Orders:** `Order.countDocuments({})`
- **Total Revenue:** Uses **MongoDB Aggregation** to sum up the `totalAmount` field across all orders in the database.

---

## 👥 4. User Management
Admins can manage the customer base to maintain order and security.

- **Viewing Users:** `GET /api/admin/users` (Lists all registered customers).
- **Updating/Banning:** `PATCH /api/admin/users/:id`. Admins can change a user's `status` (e.g., from `active` to `blocked`).
- **Deleting:** `DELETE /api/admin/users/:id`. Completely removes a user record.

---

## 📦 5. Product Management
This is the CRUD (Create, Read, Update, Delete) engine for the store.

- **Create:** `POST /api/admin/products` - Adds a new product (title, price, category, etc.).
- **Read:** `GET /api/admin/products` - Shows all inventory.
- **Update:** `PUT /api/admin/products/:id` - Fixes a price or changes a description.
- **Delete:** `DELETE /api/admin/products/:id` - Removes the product from the store.

---

## 🚚 6. Order Management
Orders have a lifecycle. The backend tracks where an order is at any time.

**Endpoint:** `GET /api/admin/orders`
We support **Status Filters** (e.g., `?status=pending`) to help admins find orders that need immediate attention.

### Status System:
- `Pending`: Order placed, waiting for action.
- `Pending COD`: Cash on delivery order waiting for confirmation.
- `Paid`: Online payment successful.
- `Delivered`: Item reached the customer.
- `Cancelled`: Order stopped by user or admin.

---

## 🔍 7. Global Search System
A powerful search tool that searches multiple collections at once.

**Endpoint:** `GET /api/admin/search?q=keyword`
Instead of searching one by one, the backend uses `Promise.all()` to search for the keyword in:
- **Users** (by name or email)
- **Products** (by title or category)
- **Orders** (by Order ID)

We use **Regex** with the `i` option (case-insensitive) so that "Shoe" and "shoe" both return the same results.

---

## 🔔 8. Admin Notification System
Notifications alert the admin to important events in real-time.

### How it works:
When a customer places an order, the backend automatically creates a record in the `Notifications` collection:
```json
{
  "type": "order",
  "message": "New order placed by John Doe",
  "isRead": false
}
```

### Endpoints:
- `GET /api/admin/notifications`: List recent notifications.
- `GET /api/admin/notifications/unread-count`: Returns the number of alerts the admin hasn't seen yet.
- `PATCH /api/admin/notifications/:id/read`: Marks an alert as "Seen".

---

## 🗄️ 9. Database Structure
Our data is organized into **Collections** in MongoDB:
1.  **Users:** Stores names, emails, passwords, and roles (`admin` or `user`).
2.  **Products:** Stores details like pricing, images, and descriptions.
3.  **Orders:** Links a `User` to multiple `Products` and stores the payment status.
4.  **Notifications:** Small alerts for system events.

---

## 📂 10. API Structure (Folders)
To keep the code clean, we follow the **MVC** (Model-View-Controller) structure:
- `models/`: Defines how the data looks (Schemas).
- `controllers/`: Contains the actual "Logic" (e.g., how to calculate revenue).
- `routes/`: Defines the URL paths (e.g., `/api/admin/login`).
- `middlewares/`: Security checks and validation logic.
- `validation/`: Schema rules for incoming data (Joi validation).

---

## 🚀 11. Performance & Best Practices
1.  **Async/Await:** Used everywhere to prevent the server from "freezing" while waiting for the database.
2.  **Indexing:** We index important fields like `email` for lightning-fast logins.
3.  **Clean Code:** We use an `asyncHandler` utility to catch any errors and send them to a central error handler, keeping our controllers neat.
4.  **Lean API Calls:** We only fetch the data the Admin needs (e.g., excluding long product descriptions when just listing titles).

---

*This guide was created to help developers understand the logic flowing through the BaeBy Admin Workspace.*
