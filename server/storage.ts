import { 
  type Student, 
  type InsertStudent, 
  type Payment, 
  type InsertPayment,
  type StudentWithBalance,
  students as studentsTable,
  payments as paymentsTable
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getAllStudents(): Promise<StudentWithBalance[]>;
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByAdmissionNo(admissionNo: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: string): Promise<boolean>;
  
  getAllPayments(): Promise<Payment[]>;
  getPaymentsByStudentId(studentId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  
  getStudentWithBalance(id: string): Promise<StudentWithBalance | undefined>;
}

export class MemStorage implements IStorage {
  private students: Map<string, Student>;
  private payments: Map<string, Payment>;

  constructor() {
    this.students = new Map();
    this.payments = new Map();
  }

  async getAllStudents(): Promise<StudentWithBalance[]> {
    const studentsArray = Array.from(this.students.values());
    const studentsWithBalance = await Promise.all(
      studentsArray.map(async (student) => {
        const payments = await this.getPaymentsByStudentId(student.id);
        const totalPaid = payments.reduce((sum, payment) => 
          sum + payment.tuitionFeePaid + payment.booksFeePaid + payment.examFeePaid, 0
        );
        const totalFees = student.totalFee + student.booksFee + student.examFee;
        return {
          ...student,
          totalPaid,
          balance: totalFees - totalPaid,
        };
      })
    );
    return studentsWithBalance;
  }

  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByAdmissionNo(admissionNo: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      (student) => student.admissionNo === admissionNo
    );
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const student: Student = {
      id,
      admissionNo: insertStudent.admissionNo,
      studentName: insertStudent.studentName,
      parentName: insertStudent.parentName,
      class: insertStudent.class,
      totalFee: insertStudent.totalFee ?? 0,
      booksFee: insertStudent.booksFee ?? 0,
      examFee: insertStudent.examFee ?? 0,
      academicYear: insertStudent.academicYear ?? "2024-2025",
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: string, updateData: Partial<InsertStudent>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    
    const updatedStudent = { ...student, ...updateData };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: string): Promise<boolean> {
    const paymentsForStudent = await this.getPaymentsByStudentId(id);
    paymentsForStudent.forEach(payment => this.payments.delete(payment.id));
    return this.students.delete(id);
  }

  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async getPaymentsByStudentId(studentId: string): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.studentId === studentId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = {
      id,
      studentId: insertPayment.studentId,
      date: insertPayment.date ? new Date(insertPayment.date) : new Date(),
      tuitionFeePaid: insertPayment.tuitionFeePaid ?? 0,
      booksFeePaid: insertPayment.booksFeePaid ?? 0,
      examFeePaid: insertPayment.examFeePaid ?? 0,
      installment: insertPayment.installment,
      paymentMode: insertPayment.paymentMode,
    };
    this.payments.set(id, payment);
    return payment;
  }

  async getStudentWithBalance(id: string): Promise<StudentWithBalance | undefined> {
    const student = await this.getStudent(id);
    if (!student) return undefined;

    const payments = await this.getPaymentsByStudentId(id);
    const totalPaid = payments.reduce((sum, payment) => 
      sum + payment.tuitionFeePaid + payment.booksFeePaid + payment.examFeePaid, 0
    );
    const totalFees = student.totalFee + student.booksFee + student.examFee;
    
    return {
      ...student,
      totalPaid,
      balance: totalFees - totalPaid,
    };
  }
}

export class PgStorage implements IStorage {
  private db;

  constructor(connectionString: string) {
    const sql = neon(connectionString);
    this.db = drizzle(sql);
  }

  async getAllStudents(): Promise<StudentWithBalance[]> {
    const students = await this.db.select().from(studentsTable);
    const studentsWithBalance = await Promise.all(
      students.map(async (student) => {
        const payments = await this.getPaymentsByStudentId(student.id);
        const totalPaid = payments.reduce((sum, payment) => 
          sum + payment.tuitionFeePaid + payment.booksFeePaid + payment.examFeePaid, 0
        );
        const totalFees = student.totalFee + student.booksFee + student.examFee;
        return {
          ...student,
          totalPaid,
          balance: totalFees - totalPaid,
        };
      })
    );
    return studentsWithBalance;
  }

  async getStudent(id: string): Promise<Student | undefined> {
    const result = await this.db.select().from(studentsTable).where(eq(studentsTable.id, id));
    return result[0];
  }

  async getStudentByAdmissionNo(admissionNo: string): Promise<Student | undefined> {
    const result = await this.db.select().from(studentsTable).where(eq(studentsTable.admissionNo, admissionNo));
    return result[0];
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const result = await this.db.insert(studentsTable).values(insertStudent).returning();
    return result[0];
  }

  async updateStudent(id: string, updateData: Partial<InsertStudent>): Promise<Student | undefined> {
    const result = await this.db.update(studentsTable)
      .set(updateData)
      .where(eq(studentsTable.id, id))
      .returning();
    return result[0];
  }

  async deleteStudent(id: string): Promise<boolean> {
    // Delete payments first (cascade)
    await this.db.delete(paymentsTable).where(eq(paymentsTable.studentId, id));
    // Then delete student
    const result = await this.db.delete(studentsTable).where(eq(studentsTable.id, id)).returning();
    return result.length > 0;
  }

  async getAllPayments(): Promise<Payment[]> {
    return await this.db.select().from(paymentsTable);
  }

  async getPaymentsByStudentId(studentId: string): Promise<Payment[]> {
    return await this.db.select().from(paymentsTable)
      .where(eq(paymentsTable.studentId, studentId))
      .orderBy(paymentsTable.date);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const result = await this.db.insert(paymentsTable).values(insertPayment).returning();
    return result[0];
  }

  async getStudentWithBalance(id: string): Promise<StudentWithBalance | undefined> {
    const student = await this.getStudent(id);
    if (!student) return undefined;

    const payments = await this.getPaymentsByStudentId(id);
    const totalPaid = payments.reduce((sum, payment) => 
      sum + payment.tuitionFeePaid + payment.booksFeePaid + payment.examFeePaid, 0
    );
    const totalFees = student.totalFee + student.booksFee + student.examFee;
    
    return {
      ...student,
      totalPaid,
      balance: totalFees - totalPaid,
    };
  }
}

// Use PostgreSQL if DATABASE_URL is set, otherwise fall back to in-memory storage
export const storage = process.env.DATABASE_URL 
  ? new PgStorage(process.env.DATABASE_URL)
  : new MemStorage();
