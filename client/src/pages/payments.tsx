import { useQuery } from "@tanstack/react-query";
import { type Payment, type StudentWithBalance } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { SearchInput } from "@/components/ui/search-input";
import { useMemo, useState } from "react";

export default function Payments() {
  const { data: payments, isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const { data: students } = useQuery<StudentWithBalance[]>({
    queryKey: ["/api/students"],
  });

  const [q, setQ] = useState("");
  const sortedPayments = payments
    ?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

  const filteredPayments = useMemo(() => {
    const list = sortedPayments;
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((p) => {
      const student = students?.find((s) => s.id === p.studentId);
      const total = p.tuitionFeePaid + p.booksFeePaid + p.examFeePaid;
      const hay = [
        student?.studentName,
        student?.admissionNo,
        student?.class,
        p.paymentMode,
        `#${p.installment}`,
        String(p.tuitionFeePaid),
        String(p.booksFeePaid),
        String(p.examFeePaid),
        String(total),
        new Date(p.date).toLocaleDateString(),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [sortedPayments, students, q]);

  if (paymentsLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }


  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-between gap-3 w-full">
        <div className="space-y-2 min-w-0 flex-1">
          <h1 className="text-3xl font-bold" data-testid="text-payments-title">Payment History</h1>
          <p className="text-muted-foreground">View all payment transactions</p>
        </div>
        <SearchInput
          placeholder="Search by student, admission no, mode"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          containerClassName="w-full md:max-w-xs lg:max-w-md"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
          <CardDescription>
            {filteredPayments.length} payment{filteredPayments.length !== 1 ? "s" : ""} recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <p className="text-muted-foreground text-sm" data-testid="text-no-payments">
              No payments recorded yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="hidden md:table-cell">Admission No</TableHead>
                  <TableHead className="hidden md:table-cell">Class</TableHead>
                  <TableHead className="hidden md:table-cell">Installment</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Tuition</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Books</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Exam</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="hidden md:table-cell">Mode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  const student = students?.find((s) => s.id === payment.studentId);
                  const total = payment.tuitionFeePaid + payment.booksFeePaid + payment.examFeePaid;
                  return (
                    <TableRow key={payment.id} data-testid={`payment-row-${payment.id}`}>
                      <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{student?.studentName || "Unknown"}</TableCell>
                      <TableCell className="hidden md:table-cell">{student?.admissionNo || "-"}</TableCell>
                      <TableCell className="hidden md:table-cell">{student?.class || "-"}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">#{payment.installment}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right">₹{payment.tuitionFeePaid.toLocaleString()}</TableCell>
                      <TableCell className="hidden md:table-cell text-right">₹{payment.booksFeePaid.toLocaleString()}</TableCell>
                      <TableCell className="hidden md:table-cell text-right">₹{payment.examFeePaid.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-bold">₹{total.toLocaleString()}</TableCell>
                      <TableCell className="hidden md:table-cell">{payment.paymentMode}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
