import { useQuery } from "@tanstack/react-query";
import { type StudentWithBalance } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import { Link } from "wouter";
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

export default function Students() {
  const { data: students, isLoading } = useQuery<StudentWithBalance[]>({
    queryKey: ["/api/students"],
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold" data-testid="text-students-title">Students</h1>
          <p className="text-muted-foreground">Manage student enrollment and fee details</p>
        </div>
        <Link href="/students/new">
          <Button data-testid="button-add-student">
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>
            {students?.length || 0} student{students?.length !== 1 ? "s" : ""} enrolled
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!students || students.length === 0 ? (
            <p className="text-muted-foreground text-sm" data-testid="text-no-students">
              No students enrolled yet. Add your first student to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Total Fees</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const totalFees = student.totalFee + student.booksFee + student.examFee;
                  const isPaid = student.balance === 0;
                  const isPartiallyPaid = student.totalPaid > 0 && student.balance > 0;

                  return (
                    <TableRow key={student.id} data-testid={`row-student-${student.admissionNo}`}>
                      <TableCell className="font-medium" data-testid={`text-admission-${student.admissionNo}`}>
                        {student.admissionNo}
                      </TableCell>
                      <TableCell>{student.studentName}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell className="text-right">₹{totalFees.toLocaleString()}</TableCell>
                      <TableCell className="text-right">₹{student.totalPaid.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-bold">
                        ₹{student.balance.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {isPaid ? (
                          <Badge variant="secondary" data-testid={`status-${student.admissionNo}`}>Paid</Badge>
                        ) : isPartiallyPaid ? (
                          <Badge variant="outline" data-testid={`status-${student.admissionNo}`}>Partial</Badge>
                        ) : (
                          <Badge variant="destructive" data-testid={`status-${student.admissionNo}`}>Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/students/${student.id}`}>
                          <Button variant="ghost" size="sm" data-testid={`button-view-${student.admissionNo}`}>
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
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
