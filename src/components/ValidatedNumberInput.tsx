import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ValidatedNumberInputProps {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  min: number;
  max: number;
  placeholder?: string;
  id?: string;
  className?: string;
  label?: string;
}

export function ValidatedNumberInput({
  value,
  onChange,
  min,
  max,
  placeholder,
  id,
  className,
}: ValidatedNumberInputProps) {
  const [error, setError] = useState<string>("");
  const [rawValue, setRawValue] = useState<string>(value != null ? String(value) : "");

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, arrows
    const allowedKeys = ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "Home", "End"];
    if (allowedKeys.includes(e.key)) return;

    // Block anything that's not a digit
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      setError("Please enter a valid number (digits only)");
      setTimeout(() => setError(""), 2000);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // Allow empty
    if (val === "") {
      setRawValue("");
      onChange(null);
      setError("");
      return;
    }

    // Only allow digits
    if (!/^\d+$/.test(val)) {
      setError("Please enter a valid number (digits only)");
      return;
    }

    const num = parseInt(val, 10);

    if (num > max) {
      setError(`Value must be at most ${max}`);
      return;
    }

    setRawValue(val);
    setError("");

    if (num >= min) {
      onChange(num);
    } else {
      onChange(num); // Allow typing, show error below
    }
  }, [min, max, onChange]);

  const handleBlur = useCallback(() => {
    if (rawValue === "") {
      setError("");
      return;
    }
    const num = parseInt(rawValue, 10);
    if (isNaN(num) || num < min || num > max) {
      setError(`Please enter a valid value (${min}–${max})`);
    } else {
      setError("");
    }
  }, [rawValue, min, max]);

  // Prevent paste of non-numeric content
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text");
    if (!/^\d+$/.test(pasted)) {
      e.preventDefault();
      setError("Please enter valid digits only");
      setTimeout(() => setError(""), 2000);
    }
  }, []);

  return (
    <div>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder={placeholder}
        value={rawValue}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onBlur={handleBlur}
        onPaste={handlePaste}
        className={cn(error && "border-destructive", className)}
      />
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}
