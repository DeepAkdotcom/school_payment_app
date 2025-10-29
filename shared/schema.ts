import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  admissionNo: text("admission_no").notNull().unique(),
  studentName: text("student_name").notNull(),
  parentName: text("parent_name").notNull(),
  class: text("class").notNull(),
  totalFee: integer("total_fee").notNull().default(0),
  booksFee: integer("books_fee").notNull().default(0),
  examFee: integer("exam_fee").notNull().default(0),
  academicYear: text("academic_year").notNull().default("2025-2026"),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  date: timestamp("date").notNull().defaultNow(),
  tuitionFeePaid: integer("tuition_fee_paid").notNull().default(0),
  booksFeePaid: integer("books_fee_paid").notNull().default(0),
  examFeePaid: integer("exam_fee_paid").notNull().default(0),
  installment: integer("installment").notNull(),
  paymentMode: text("payment_mode").notNull(),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
}).extend({
  date: z.union([z.string(), z.date()]).optional(),
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type StudentWithBalance = Student & {
  totalPaid: number;
  balance: number;
};

export type PaymentWithDetails = Payment & {
  totalAmount: number;
};
