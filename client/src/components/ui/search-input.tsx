import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface SearchInputProps extends React.ComponentProps<"input"> {
  containerClassName?: string;
}

/**
 * SearchInput
 * - Renders an input with a leading search icon.
 * - Pass width classes in either containerClassName (preferred) or className.
 * - For typical usage, keep the default Input width behavior and add pl-8 for icon spacing.
 */
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("relative w-full", containerClassName)}>
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input ref={ref} className={cn("pl-8", className)} {...props} />
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
