import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudentSchema, insertPaymentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/students", async (_req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/students/:id", async (req, res) => {
    try {
      const student = await storage.getStudentWithBalance(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      
      const existingStudent = await storage.getStudentByAdmissionNo(validatedData.admissionNo);
      if (existingStudent) {
        return res.status(400).json({ message: "Admission number already exists" });
      }
      
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/students/:id", async (req, res) => {
    try {
      const validatedData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(req.params.id, validatedData);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteStudent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/students/:id/payments", async (req, res) => {
    try {
      const payments = await storage.getPaymentsByStudentId(req.params.id);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      
      const student = await storage.getStudent(validatedData.studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      const payment = await storage.createPayment(validatedData);
      res.status(201).json(payment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/payments", async (_req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
