# 💰 ExpenseFlow — Personal Finance Tracker

ExpenseFlow is a full-stack expense tracking application that helps users manage their income and expenses, organize transactions by category, and generate detailed Excel reports — all wrapped in a modern, responsive dark-themed UI.

![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-API-000000?logo=express&logoColor=white)

---


---

## ✨ Features

### Authentication
- User registration with name, age, email, and password
- Secure login with JWT-based authentication (Bearer token + optional httpOnly cookie)
- Protected routes with auth middleware
- Persistent sessions via `localStorage`

### Transaction Management
- Create, edit, and delete income/expense transactions
- Each transaction includes: title, description, amount, category, type (Income/Expense), and date
- Date picker with default to current date, and prevents future-dated entries
- Real-time calculation of total balance, total income, and total expense (calculated on the backend)

### Categories
- Create, edit, and delete custom categories
- Assign categories to transactions for better organization
- Searchable category dropdown when creating/editing transactions

### Dashboard
- At-a-glance summary cards: **Total Balance**, **Total Income**, **Total Expense**
- Recent transactions table (latest 5)
- Quick-access "Add Transaction" button
- Fully responsive — collapses gracefully on mobile

### All Transactions Page
- Full transaction history in a searchable, sortable, paginated data table
- Inline edit and delete actions with confirmation dialogs
- Global search across title, description, amount, and type
- Currency formatted in PKR (Rs.)

### Reports
- Select a custom start and end date range
- Generates and downloads a professionally styled **Excel (.xlsx)** report via `ExcelJS`
- Report includes:
  - Summary cards (Total Income / Expense / Net Balance)
  - Category breakdown with share percentages
  - Full tabular transaction listing
  - Styled headers, zebra striping, and currency formatting

### Navigation
- Collapsible left sidebar navigation (desktop)
- Mobile-friendly top bar with hamburger menu
- Bottom tab navigation bar for mobile (Dashboard, Transactions, Add, Reports, Categories)


## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React (Vite) | UI framework |
| React Router DOM | Client-side routing |
| React Hook Form | Form state management |
| Yup | Schema-based form validation |
| PrimeReact | UI component library (DataTable, Dropdown, Calendar, Dialog, Toast) |
| Tailwind CSS | Utility-first styling |
| Axios | HTTP client with interceptors |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | Web framework / REST API |
| MongoDB + Mongoose | Database and ODM |
| JWT (jsonwebtoken) | Authentication |
| bcrypt | Password hashing |
| ExcelJS | Excel report generation |
| CORS | Cross-origin request handling |
| cookie-parser | Cookie handling |
| dotenv | Environment variable management |

---

## 📁 Project Structure

```
expense-tracker/

 frontend/
    ├── public/
    │   └── favicon.svg
    ├── src/
    │   ├── apis/
    │   │   └── axios.js
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   └── Navbar.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ToastContext.jsx
    │   ├── Pages/
    │   │   ├── Auths/
    │   │   │   ├── Register.jsx
    │   │   │   └── Login.jsx
    │   │   ├── Expenses/
    │   │   │   ├── CreateTransaction.jsx
    │   │   │   ├── EditTransaction.jsx
    │   │   │   └── AllTransactions.jsx
    │   │   ├── Categories/
    │   │   │   ├── AllCategories.jsx
    │   │   │   ├── CreateCategory.jsx
    │   │   │   └── EditCategory.jsx
    │   │   ├── dashboard.jsx
    │   │   └── Reports.jsx
    │   ├── validations/
    │   │   ├── RegisterSchema.js
    │   │   ├── LoginSchema.js
    │   │   ├── ExpenseSchema.js
    │   │   └── CategorySchema.js
    │   └── App.jsx
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local instance or MongoDB Atlas cloud cluster)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker
```

###  Frontend Setup

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173` by default (Vite's default port).

### 2. Open the App

Navigate to `http://localhost:5173` in your browser, register a new account, and start tracking your expenses!

---



> ⚠️ Never commit your `.env` file to version control. Add it to `.gitignore`.

If using **MongoDB Atlas**, make sure your current IP address is whitelisted under **Network Access** in the Atlas dashboard (or use `0.0.0.0/0` for development only).

---

## 🔌 API Endpoints

### Auth Routes (`/user`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/user/register` | Register a new user |
| POST | `/user/login` | Login and receive JWT token |

### Expense Routes (`/expense`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/expense/AllExpense` | Get all expenses for logged-in user |
| GET | `/expense/GetExpenseById/:id` | Get a single expense by ID |
| POST | `/expense/create` | Create a new transaction |
| PUT | `/expense/update/:id` | Update an existing transaction |
| DELETE | `/expense/delete/:id` | Delete a transaction |
| POST | `/expense/export` | Generate and download Excel report for a date range |

### Category Routes (`/category`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/category/AllCategory` | Get all categories for logged-in user |
| GET | `/category/GetCategoryById/:id` | Get a single category by ID |
| POST | `/category/create` | Create a new category |
| PUT | `/category/update/:id` | Update an existing category |
| DELETE | `/category/delete/:id` | Delete a category |

> All routes except `/user/register` and `/user/login` require a valid JWT sent via the `Authorization: Bearer <token>` header.

---

## 🖥 Screens & Pages

| Page | Route | Description |
|---|---|---|
| Register | `/register` | New user sign-up form |
| Login | `/` | User sign-in form |
| Dashboard | `/dashboard` | Summary cards + recent transactions |
| All Transactions | `/expenses/all` | Full transaction list with search, sort, filter |
| Create Transaction | `/expenses/create` | Add new income/expense form |
| Edit Transaction | `/expenses/edit/:id` | Update an existing transaction |
| All Categories | `/categories` | List, search, and manage categories |
| Create Category | `/categories/create` | Add a new category |
| Edit Category | `/categories/edit/:id` | Update an existing category |
| Reports | `/reports` | Select date range and download Excel report |

---


## 🙌 Acknowledgements

Built with ❤️ using React, Node.js, and MongoDB — styled with Tailwind CSS and PrimeReact.