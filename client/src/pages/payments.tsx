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

export default function Payments() {
  const { data: payments, isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const { data: students } = useQuery<StudentWithBalance[]>({
    queryKey: ["/api/students"],
  });

  if (paymentsLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const sortedPayments = payments
    ?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold" data-testid="text-payments-title">Payment History</h1>
        <p className="text-muted-foreground">View all payment transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
          <CardDescription>
            {sortedPayments.length} payment{sortedPayments.length !== 1 ? "s" : ""} recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedPayments.length === 0 ? (
            <p className="text-muted-foreground text-sm" data-testid="text-no-payments">
              No payments recorded yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Admission No</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Installment</TableHead>
                  <TableHead className="text-right">Tuition</TableHead>
                  <TableHead className="text-right">Books</TableHead>
                  <TableHead className="text-right">Exam</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Mode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPayments.map((payment) => {
                  const student = students?.find((s) => s.id === payment.studentId);
                  const total = payment.tuitionFeePaid + payment.booksFeePaid + payment.examFeePaid;
                  return (
                    <TableRow key={payment.id} data-testid={`payment-row-${payment.id}`}>
                      <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{student?.studentName || "Unknown"}</TableCell>
                      <TableCell>{student?.admissionNo || "-"}</TableCell>
                      <TableCell>{student?.class || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">#{payment.installment}</Badge>
                      </TableCell>
                      <TableCell className="text-right">₹{payment.tuitionFeePaid.toLocaleString()}</TableCell>
                      <TableCell className="text-right">₹{payment.booksFeePaid.toLocaleString()}</TableCell>
                      <TableCell className="text-right">₹{payment.examFeePaid.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-bold">₹{total.toLocaleString()}</TableCell>
                      <TableCell>{payment.paymentMode}</TableCell>
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
