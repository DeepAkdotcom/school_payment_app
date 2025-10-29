# Sri Sudha Vidyaniketan Fee Management System

## Overview

This is a full-stack fee management application built for Sri Sudha Vidyaniketan educational institution. The system enables tracking of student enrollments, fee structures (tuition, books, exams), and payment records with installment support. It provides a dashboard for financial overview, student management capabilities, and comprehensive payment history tracking.

**Core Value**: Transitions from error-prone manual system to a real-time, cloud-based application that atomically links student enrollment records with payment history, eliminating manual fee calculations and providing instant visibility of student balances with professional receipt generation.

## Recent Changes

**Date: October 25, 2025**
- Initial implementation of complete fee management system
- Created data model with students and payments tables
- Implemented in-memory storage with automatic balance calculation
- Built all frontend pages: Dashboard, Students, Student Detail, Payments
- Added professional receipt generation matching school template
- Configured sidebar navigation and professional green theme
- All features tested and working end-to-end

## User Preferences

- Preferred communication style: Simple, everyday language
- Focus on practical, real-world school administration needs
- Professional appearance with clean, accessible UI

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript running on Vite
- **Routing**: Wouter for client-side routing
  - Pages: Dashboard (/), Students (/students), Student Form (/students/new), Student Detail (/students/:id), Payments (/payments)
- **State Management**: TanStack Query (React Query) for server state with infinite staleTime
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with professional green theme
- **Form Handling**: React Hook Form with Zod validation for type-safe form schemas

**Design System**:
- Typography: Inter for headings/UI, Open Sans for body text
- Color Scheme: Professional green theme (142, 76%, 36%) for primary actions
- Layout: Responsive grid system with sidebar navigation
- Theme: Light/dark mode support with localStorage persistence
- Component Pattern: shadcn/ui components with consistent spacing and elevation

**Key Pages**:
1. **Dashboard**: Financial overview with summary cards (Total Students, Collected, Outstanding, Pending)
2. **Students**: List view with real-time balance, status badges (Paid/Partial/Pending)
3. **Student Form**: Enrollment with admission number, fee structure (tuition, books, exam)
4. **Student Detail**: Complete payment history, payment recording dialog, receipt generation
5. **Payments**: Complete transaction history across all students

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API with JSON responses
- **Request Logging**: Custom middleware tracking method, path, status, duration
- **Validation**: Zod schemas shared between frontend and backend via /shared directory
- **Error Handling**: Centralized error responses with appropriate HTTP status codes

**API Endpoints**:
- GET /api/students - Retrieve all students with calculated balances
- GET /api/students/:id - Get single student with balance details
- POST /api/students - Create new student (validates unique admission number)
- PUT /api/students/:id - Update student information
- DELETE /api/students/:id - Remove student and all payment records
- GET /api/students/:id/payments - Get payment history for specific student
- GET /api/payments - Retrieve all payment transactions
- POST /api/payments - Record new payment (validates student exists, calculates balance)

**Key Architectural Decisions**:
- Storage abstraction (IStorage interface) allows easy swap between in-memory and database
- Shared Zod schemas prevent type drift between client and server
- Balance calculation performed in application layer for accuracy
- Payment validation ensures data integrity (no orphaned payments)

### Data Storage

**Current Implementation**: In-memory storage (MemStorage class)
- Suitable for development and single-instance deployment
- Data persists during application runtime
- Automatic balance recalculation on every query

**Database Schema** (defined for future PostgreSQL migration):
- **students** table:
  - id (UUID primary key)
  - admissionNo (unique text, e.g., "240001")
  - studentName, parentName, class (text)
  - totalFee, booksFee, examFee (integers in rupees)
  - academicYear (text, default "2025-2026")

- **payments** table:
  - id (UUID primary key)
  - studentId (foreign key to students)
  - date (timestamp)
  - tuitionFeePaid, booksFeePaid, examFeePaid (integers in rupees)
  - installment (integer, payment number)
  - paymentMode (text: Cash, UPI, Card, Cheque, Bank Transfer)

**Balance Calculation Logic**:
- Total Fees = student.totalFee + student.booksFee + student.examFee
- Total Paid = SUM(payment.tuitionFeePaid + payment.booksFeePaid + payment.examFeePaid)
- Balance = Total Fees - Total Paid
- Calculated in real-time on every student query

### Key Features

1. **Real-time Balance Tracking**
   - Automatic calculation eliminates manual errors
   - Instant visibility across all views (Dashboard, Students, Detail)
   - Color-coded status badges (Paid/Partial/Pending)

2. **Payment Recording**
   - Fee breakdown by category (tuition, books, exam)
   - Installment tracking
   - Multiple payment modes supported
   - Date stamping for audit trail

3. **Professional Receipt Generation**
   - Matches school's official template format
   - Shows complete student details and fee breakdown
   - Ready for printing with proper formatting
   - Generated instantly upon payment recording

4. **Financial Dashboard**
   - Summary cards for quick overview
   - Recent payment activity
   - Outstanding balance tracking
   - Student count with pending payments

5. **Navigation & UX**
   - Sidebar navigation for easy access
   - Light/dark theme toggle
   - Loading states and skeletons
   - Toast notifications for user feedback
   - Responsive design for various screen sizes

### External Dependencies

**Key Libraries**:
- **UI Components**: @radix-ui/* primitives for accessible components
- **Styling**: tailwindcss, autoprefixer, postcss
- **Forms**: react-hook-form with @hookform/resolvers
- **Validation**: zod for runtime type checking and drizzle-zod for schema generation
- **Data Fetching**: @tanstack/react-query for server state management
- **Routing**: wouter for client-side routing
- **Icons**: lucide-react for consistent iconography
- **Build Tools**: vite, esbuild for development and production builds

### Testing & Quality Assurance

**Tested Scenarios** (October 25, 2025):
1. Student enrollment with complete fee structure
2. Payment recording with fee breakdown
3. Balance calculation accuracy
4. Receipt generation matching template
5. Dashboard summary calculations
6. Navigation between all pages
7. Form validation and error handling

**Test Results**: All core features working as expected. Minor accessibility warning about dialog aria-describedby (non-blocking).

## Future Enhancements (Suggested by Architect Review)

1. **Overpayment Protection**: Add warnings when payment would drive balance negative
2. **Data Persistence**: Migrate from in-memory to PostgreSQL for production use
3. **Automated Tests**: Expand test coverage for payment mutations and balance calculations
4. **Reporting**: Add monthly/yearly financial reports
5. **Bulk Operations**: Import/export student data, bulk payment processing
6. **User Authentication**: Multi-user access with role-based permissions (Principal, Office Staff, View-only)
