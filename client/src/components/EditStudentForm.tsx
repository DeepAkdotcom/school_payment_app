import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentSchema, type InsertStudent, type StudentWithBalance } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
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

export function EditStudentForm({ student, onSuccess }: { student: StudentWithBalance; onSuccess: () => void }) {
  const form = useForm<InsertStudent>({
    resolver: zodResolver(insertStudentSchema),
    defaultValues: {
      admissionNo: student.admissionNo,
      studentName: student.studentName,
      parentName: student.parentName,
      class: student.class,
      totalFee: student.totalFee,
      booksFee: student.booksFee,
      examFee: student.examFee,
      academicYear: student.academicYear,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: InsertStudent) => {
      const res = await apiRequest("PUT", `/api/students/${student.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students", student.id] });
      onSuccess();
    },
  });

 const getClassSuffix = (numStr: string): string => {
    // Attempt to parse the string as an integer
    const num = parseInt(numStr, 10);
    
    // Check if it's a valid number. If not, default to "th" for non-LKG/UKG strings.
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

    // 1. Define classes that should NOT have any suffix.
    const nonSuffixClasses = ["LKG", "UKG", "NURSERY", "PREP", "PLAYGROUP"]; 
    
    // 2. Remove any existing ordinal suffix (th, st, nd, rd)
    const cleanedClass = className.replace(/(st|nd|rd|th)$/i, "");
    
    // 3. Convert to uppercase for case-insensitive comparison
    const upperCleanedClass = cleanedClass.toUpperCase();
    
    let normalizedClass;

    if (nonSuffixClasses.includes(upperCleanedClass)) {
        // Case A: LKG, UKG, etc. -> Use the cleaned class as is.
        normalizedClass = upperCleanedClass;
    } else {
        // Case B: Numeric or other classes -> Determine and append the correct suffix.
        const suffix = getClassSuffix(cleanedClass);
        normalizedClass = cleanedClass + suffix;
    }

    mutate({ ...data, class: normalizedClass });
};

  return (
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
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
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="submit" disabled={isPending} data-testid="button-save-student">
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
