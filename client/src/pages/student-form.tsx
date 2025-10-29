import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentSchema, type InsertStudent } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function StudentForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<InsertStudent>({
    resolver: zodResolver(insertStudentSchema),
    defaultValues: {
      admissionNo: "",
      studentName: "",
      parentName: "",
      class: "",
      totalFee: 0,
      booksFee: 0,
      examFee: 0,
      academicYear: "2025-2026",
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: async (data: InsertStudent) => {
      const res = await apiRequest("POST", "/api/students", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "Success",
        description: "Student added successfully",
      });
      setLocation("/students");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add student",
        variant: "destructive",
      });
    },
  });

  // Helper function to determine the correct ordinal suffix (st, nd, rd, th)
const getClassSuffix = (classStr: string): string => {
    // Attempt to parse the string as an integer
    const num = parseInt(classStr, 10);
    
    // If it's not a valid number, we'll default to 'th' later or let the exception logic handle it.
    if (isNaN(num)) {
        return "th"; 
    }

    // Special cases: 11th, 12th, 13th
    const lastTwoDigits = num % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
        return "th";
    }

    // General cases based on the last digit
    const lastDigit = num % 10;
    switch (lastDigit) {
        case 1:
            return "st";
        case 2:
            return "nd";
        case 3:
            return "rd";
        default:
            return "th";
    }
};


const onSubmit = (data: InsertStudent) => {
    const className = (data.class || "").trim();

    // 1. Define classes that should NOT have any suffix (LKG, UKG, Nursery, etc.).
    const nonSuffixClasses = ["LKG", "UKG", "NURSERY", "PREP", "PLAYGROUP"]; 
    
    // 2. Remove any existing ordinal suffix (th, st, nd, rd) for a clean base.
    const cleanedClass = className.replace(/(st|nd|rd|th)$/i, "");
    
    // 3. Convert to uppercase for case-insensitive comparison against the exception list.
    const upperCleanedClass = cleanedClass.toUpperCase();
    
    let normalizedClass;

    if (nonSuffixClasses.includes(upperCleanedClass)) {
        // Case A: Exception classes (LKG, UKG) -> Use the cleaned class as is.
        normalizedClass = upperCleanedClass;
    } else {
        // Case B: Numeric or other classes -> Determine and append the correct suffix.
        const suffix = getClassSuffix(cleanedClass);
        normalizedClass = cleanedClass + suffix;
    }

    // Use the correct mutation variable from your snippet
    createStudentMutation.mutate({ ...data, class: normalizedClass });
};

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/students">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold" data-testid="text-form-title">Add New Student</h1>
          <p className="text-muted-foreground">Enter student and fee details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>Fill in the details for the new student</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="admissionNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admission Number</FormLabel>
                      <FormControl>
                        <Input placeholder="240101" {...field} data-testid="input-admission-no" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="academicYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Academic Year</FormLabel>
                      <FormControl>
                        <Input placeholder="2025-2026" {...field} data-testid="input-academic-year" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="studentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter student name" {...field} data-testid="input-student-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter parent name" {...field} data-testid="input-parent-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <FormControl>
                        <Input placeholder="LKG, UKG, 1, 2, etc." {...field} data-testid="input-class" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tuition Fee (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="15000"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-total-fee"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="booksFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Books Fee (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2700"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-books-fee"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="examFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Fee (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-exam-fee"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createStudentMutation.isPending}
                  data-testid="button-submit"
                >
                  {createStudentMutation.isPending ? "Adding..." : "Add Student"}
                </Button>
                <Link href="/students">
                  <Button type="button" variant="outline" data-testid="button-cancel">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
