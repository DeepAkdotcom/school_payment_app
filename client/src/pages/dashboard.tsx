import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type StudentWithBalance, type Payment } from "@shared/schema";
import { IndianRupee, Users, TrendingUp, AlertCircle, Banknote } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: students, isLoading: studentsLoading } = useQuery<StudentWithBalance[]>({
    queryKey: ["/api/students"],
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  if (studentsLoading || paymentsLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const totalStudents = students?.length || 0;
  const totalOutstanding = students?.reduce((sum, s) => sum + s.balance, 0) || 0;
  const totalCollected = students?.reduce((sum, s) => sum + s.totalPaid, 0) || 0;
  const totalFeesAll = students?.reduce((sum, s) => sum + s.totalFee + s.booksFee + s.examFee, 0) || 0;
  const studentsWithBalance = students?.filter((s) => s.balance > 0).length || 0;

  const recentPayments = payments
    ?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5) || [];

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground">Financial overview and summary</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl text-stone-400 font-bold" data-testid="text-total-students">{totalStudents}</div>
          </CardContent>
        </Card>

         <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Fees</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl text-yellow-500 font-bold" data-testid="text-total-fees-all">₹{totalFeesAll.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-status-online" data-testid="text-total-collected">₹{totalCollected.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-destructive" data-testid="text-outstanding-balance">₹{totalOutstanding.toLocaleString()}</div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students With Balance</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold" data-testid="text-students-with-balance">{studentsWithBalance}</div>
          </CardContent>
        </Card> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest fee payments recorded</CardDescription>
        </CardHeader>
        <CardContent>
          {recentPayments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No payments recorded yet</p>
          ) : (
            <div className="space-y-2">
              {recentPayments.map((payment) => {
                const student = students?.find((s) => s.id === payment.studentId);
                const totalAmount = payment.tuitionFeePaid + payment.booksFeePaid + payment.examFeePaid;
                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 rounded-md border"
                    data-testid={`payment-${payment.id}`}
                  >
                    <div>
                      <p className="font-medium">{student?.studentName || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString()} - {payment.paymentMode}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{totalAmount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Installment {payment.installment}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
