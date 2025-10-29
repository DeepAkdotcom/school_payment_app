# Student Fee Management System

A comprehensive web application for managing student fees and payments in educational institutions.

## Overview

This is a student fee management system designed for schools and educational institutions. It helps administrators efficiently track student information, manage fees, record payments, and monitor outstanding dues.

## Features

### Student Management
- Add, edit, and manage student profiles
- Store student information (admission number, name, class, parent details)
- Track students by academic year
- Easy search and filtering

### Fee Tracking
- Categorized fee structure (Tuition, Books, Exams)
- Define total fees for each student
- Track fee schedules by academic year

### Payment Management
- Record student fee payments
- Track installment-based payments
- Support multiple payment modes (cash, check, online, etc.)
- View complete payment history for each student

### Financial Dashboard
- Real-time overview of financial metrics
- Total students count
- Total fees collected
- Outstanding balance calculation
- Pending payments summary
- Recent transactions feed

### Reports & Analytics
- Individual student payment history
- Outstanding dues list
- Payment status tracking
- Financial summaries

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/DeepAkdotcom/school_payment_app.git
cd school_payment_app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with:
```
DATABASE_URL=<your-postgresql-connection-string>
PORT=8080
NODE_ENV=development
```

4. Setup database
```bash
npm run db:push
```

5. Run development server
```bash
npm run dev
```

6. Build for production
```bash
npm run build
npm run start
```

## Project Structure

```
school_payment_app/
├── client/              # React frontend
│   └── src/
│       ├── pages/       # Application pages (Dashboard, Students, Payments)
│       ├── components/  # Reusable UI components
│       └── lib/         # Utilities and hooks
├── server/              # Express backend
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Database operations
│   └── index.ts         # Server setup
├── shared/              # Shared types and schemas
│   └── schema.ts        # Data models
└── public/              # Static files
```

## Pages

- **Dashboard** – Financial overview with key metrics and recent transactions
- **Students** – List of all students with management options
- **Student Detail** – Individual student profile and payment history
- **Payments** – Complete payment records and transaction history
- **Add Student** – Form to register new students

## API Endpoints

### Students
- `GET /api/students` – Get all students
- `GET /api/students/:id` – Get student details
- `POST /api/students` – Create new student
- `PUT /api/students/:id` – Update student
- `DELETE /api/students/:id` – Delete student

### Payments
- `GET /api/payments` – Get all payments
- `POST /api/payments` – Record new payment
- `GET /api/students/:id/payments` – Get payments for specific student

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas
- **UI Components**: Radix UI + Tailwind CSS

## Usage

1. **Add Students** – Go to "Add Student" page and fill in student details
2. **Record Payments** – Navigate to student detail page and add payment records
3. **View Dashboard** – Check financial metrics and recent transactions
4. **Track Dues** – View outstanding balance for each student
5. **Generate Reports** – Access payment history and financial summaries

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for suggestions.

## Support

For issues or questions, please create an issue in the repository.

---

**school_payment_app** - Making student fee management simple and efficient
