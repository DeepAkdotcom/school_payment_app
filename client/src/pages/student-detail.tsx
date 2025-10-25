import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { type StudentWithBalance, type Payment, insertPaymentSchema, type InsertPayment } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Receipt } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StudentDetail() {
  const [, params] = useRoute("/students/:id");
  const studentId = params?.id;
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const { data: student, isLoading } = useQuery<StudentWithBalance>({
    queryKey: ["/api/students", studentId],
    enabled: !!studentId,
  });

  const { data: payments } = useQuery<Payment[]>({
    queryKey: ["/api/students", studentId, "payments"],
    enabled: !!studentId,
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Student not found</p>
      </div>
    );
  }

  const totalFees = student.totalFee + student.booksFee + student.examFee;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/students">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 space-y-1">
          <h1 className="text-3xl font-bold" data-testid="text-student-name">{student.studentName}</h1>
          <p className="text-muted-foreground">Admission No: {student.admissionNo} | Class: {student.class}</p>
        </div>
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-record-payment">
              <Plus className="h-4 w-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Enter payment details for {student.studentName}
              </DialogDescription>
            </DialogHeader>
            <PaymentForm
              studentId={student.id}
              onSuccess={(payment) => {
                setShowPaymentDialog(false);
                setSelectedPayment(payment);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-fees">₹{totalFees.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary" data-testid="text-total-paid">
              ₹{student.totalPaid.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="text-balance-due">
              ₹{student.balance.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tuition Fee</span>
              <span className="font-medium">₹{student.totalFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Books Fee</span>
              <span className="font-medium">₹{student.booksFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Exam Fee</span>
              <span className="font-medium">₹{student.examFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">₹{totalFees.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            {payments?.length || 0} payment{payments?.length !== 1 ? "s" : ""} recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!payments || payments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No payments recorded yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Installment</TableHead>
                  <TableHead className="text-right">Tuition</TableHead>
                  <TableHead className="text-right">Books</TableHead>
                  <TableHead className="text-right">Exam</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead className="text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => {
                  const total = payment.tuitionFeePaid + payment.booksFeePaid + payment.examFeePaid;
                  return (
                    <TableRow key={payment.id} data-testid={`payment-row-${payment.id}`}>
                      <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">#{payment.installment}</Badge>
                      </TableCell>
                      <TableCell className="text-right">₹{payment.tuitionFeePaid.toLocaleString()}</TableCell>
                      <TableCell className="text-right">₹{payment.booksFeePaid.toLocaleString()}</TableCell>
                      <TableCell className="text-right">₹{payment.examFeePaid.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-bold">₹{total.toLocaleString()}</TableCell>
                      <TableCell>{payment.paymentMode}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPayment(payment)}
                          data-testid={`button-view-receipt-${payment.id}`}
                        >
                          <Receipt className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedPayment && (
        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Fee Receipt</DialogTitle>
            </DialogHeader>
            <div ref={receiptRef}>
              <ReceiptView student={student} payment={selectedPayment} />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => window.print()} data-testid="button-print-receipt">
                Print Receipt
              </Button>
              <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function PaymentForm({ studentId, onSuccess }: { studentId: string; onSuccess: (payment: Payment) => void }) {
  const { toast } = useToast();

  const form = useForm<InsertPayment>({
    resolver: zodResolver(insertPaymentSchema),
    defaultValues: {
      studentId,
      tuitionFeePaid: 0,
      booksFeePaid: 0,
      examFeePaid: 0,
      installment: 1,
      paymentMode: "Cash",
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: InsertPayment) => {
      const res = await apiRequest("POST", "/api/payments", data);
      return res.json();
    },
    onSuccess: (payment: Payment) => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students", studentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/students", studentId, "payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
      onSuccess(payment);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record payment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPayment) => {
    createPaymentMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="tuitionFeePaid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tuition Fee Paid (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    data-testid="input-tuition-fee-paid"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="booksFeePaid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Books Fee Paid (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    data-testid="input-books-fee-paid"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="examFeePaid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exam Fee Paid (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    data-testid="input-exam-fee-paid"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="installment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Installment Number</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    data-testid="input-installment"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Mode</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-payment-mode">
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={createPaymentMutation.isPending}
          className="w-full"
          data-testid="button-submit-payment"
        >
          {createPaymentMutation.isPending ? "Recording..." : "Record Payment"}
        </Button>
      </form>
    </Form>
  );
}

function ReceiptView({ student, payment }: { student: StudentWithBalance; payment: Payment }) {
  const total = payment.tuitionFeePaid + payment.booksFeePaid + payment.examFeePaid;

  return (
    <div className="p-8 bg-white text-black print:p-0" data-testid="receipt-view">
      <div className="text-center mb-6 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold">SRI SUDHA VIDYANIKETAN</h1>
        <p className="text-sm">RAJAHMAHENDRAVARAM, PH NO: 94949499494</p>
        <h2 className="text-xl font-semibold mt-4">RECEIPT</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p><strong>Admission No:</strong> {student.admissionNo}</p>
          <p><strong>Student Name:</strong> {student.studentName}</p>
          <p><strong>Parent's Name:</strong> {student.parentName}</p>
        </div>
        <div>
          <p><strong>Academic Year:</strong> {student.academicYear}</p>
          <p><strong>Date:</strong> {new Date(payment.date).toLocaleDateString()}</p>
          <p><strong>Class:</strong> {student.class}</p>
        </div>
      </div>

      <table className="w-full border-collapse border border-black mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-2 text-left">S.No</th>
            <th className="border border-black p-2 text-left">Particulars</th>
            <th className="border border-black p-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {payment.tuitionFeePaid > 0 && (
            <tr>
              <td className="border border-black p-2">1</td>
              <td className="border border-black p-2">Tuition Fee</td>
              <td className="border border-black p-2 text-right">₹{payment.tuitionFeePaid.toLocaleString()}</td>
            </tr>
          )}
          {payment.booksFeePaid > 0 && (
            <tr>
              <td className="border border-black p-2">{payment.tuitionFeePaid > 0 ? 2 : 1}</td>
              <td className="border border-black p-2">Books Fee</td>
              <td className="border border-black p-2 text-right">₹{payment.booksFeePaid.toLocaleString()}</td>
            </tr>
          )}
          {payment.examFeePaid > 0 && (
            <tr>
              <td className="border border-black p-2">{(payment.tuitionFeePaid > 0 ? 1 : 0) + (payment.booksFeePaid > 0 ? 1 : 0) + 1}</td>
              <td className="border border-black p-2">Exam Fee</td>
              <td className="border border-black p-2 text-right">₹{payment.examFeePaid.toLocaleString()}</td>
            </tr>
          )}
          <tr className="font-bold">
            <td className="border border-black p-2" colSpan={2}>Total Amount:</td>
            <td className="border border-black p-2 text-right">₹{total.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <p className="mb-8"><strong>Payment Mode:</strong> {payment.paymentMode}</p>

      <div className="flex justify-between mt-16">
        <div>
          <p className="border-t border-black inline-block px-8">Principal Signature</p>
        </div>
        <div>
          <p className="border-t border-black inline-block px-8">Parent Signature</p>
        </div>
      </div>
    </div>
  );
}
