import { useQuery, useMutation } from "@tanstack/react-query";
import { type StudentWithBalance } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Pencil, Trash } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditStudentForm } from "@/components/EditStudentForm";
import { SearchInput } from "@/components/ui/search-input";
import { useMemo, useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Students() {
  const { data: students, isLoading } = useQuery<StudentWithBalance[]>({
    queryKey: ["/api/students"],
  });
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [editStudent, setEditStudent] = useState<StudentWithBalance | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({ title: "Deleted", description: "Student deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete student", variant: "destructive" });
    },
  });

  const filteredStudents = useMemo(() => {
    const list = students ?? [];
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((s) => {
      const hay = [
        s.studentName,
        s.admissionNo,
        s["class"],
        String(s.totalFee + s.booksFee + s.examFee),
        String(s.totalPaid),
        String(s.balance),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [students, q]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold" data-testid="text-students-title">Students</h1>
          <p className="text-muted-foreground">Manage student enrollment and fee details</p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Search by name, admission no, class"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            containerClassName="w-full sm:w-64 md:w-72"
          />
          <Link href="/students/new">
            <Button  variant="action" data-testid="button-add-student">
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>
            {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""} enrolled
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <p className="text-muted-foreground text-sm" data-testid="text-no-students">
              No students enrolled yet. Add your first student to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="hidden md:table-cell">Class</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Total Fees</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const totalFees = student.totalFee + student.booksFee + student.examFee;
                  const isPaid = student.balance === 0;
                  const isPartiallyPaid = student.totalPaid > 0 && student.balance > 0;

                  return (
                    <TableRow key={student.id} data-testid={`row-student-${student.admissionNo}`}>
                      <TableCell className="font-medium" data-testid={`text-admission-${student.admissionNo}`}>
                        {student.admissionNo}
                      </TableCell>
                      <TableCell>{student.studentName}</TableCell>
                      <TableCell className="hidden md:table-cell">{student["class"]}</TableCell>
                      <TableCell className="hidden md:table-cell text-right">₹{totalFees.toLocaleString()}</TableCell>
                      <TableCell className="hidden md:table-cell text-right">₹{student.totalPaid.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-bold">
                        ₹{student.balance.toLocaleString()}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {isPaid ? (
                          <Badge variant="secondary" data-testid={`status-${student.admissionNo}`}>Paid</Badge>
                        ) : isPartiallyPaid ? (
                          <Badge variant="outline" data-testid={`status-${student.admissionNo}`}>Partial</Badge>
                        ) : (
                          <Badge variant="destructive" data-testid={`status-${student.admissionNo}`}>Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/students/${student.id}`}>
                            <Button variant="ghost" size="sm" data-testid={`button-view-${student.admissionNo}`}>
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setEditStudent(student)}
                            data-testid={`button-edit-${student.admissionNo}`}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this student? This will remove all payments as well.")) {
                                deleteMutation.mutate(student.id);
                              }
                            }}
                            data-testid={`button-delete-${student.admissionNo}`}
                          >
                            <Trash className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editStudent} onOpenChange={() => setEditStudent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          {editStudent && (
            <EditStudentForm
              student={editStudent}
              onSuccess={() => setEditStudent(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}