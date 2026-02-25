import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";

interface Props {
  password: string;
}

const rules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /\d/.test(p) },
  { label: "Special character", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export function validatePasswordStrength(password: string) {
  return rules.every((r) => r.test(password));
}

export default function PasswordStrengthIndicator({ password }: Props) {
  const passed = useMemo(() => rules.filter((r) => r.test(password)).length, [password]);
  const strength = Math.round((passed / rules.length) * 100);
  const color = strength <= 20 ? "bg-destructive" : strength <= 60 ? "bg-accent" : "bg-primary";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Progress value={strength} className="h-2 flex-1" />
        <span className="text-xs text-muted-foreground font-medium">
          {strength <= 20 ? "Weak" : strength <= 60 ? "Fair" : strength < 100 ? "Good" : "Strong"}
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-1">
        {rules.map((r) => {
          const ok = r.test(password);
          return (
            <li key={r.label} className={`flex items-center gap-1.5 text-xs ${ok ? "text-primary" : "text-muted-foreground"}`}>
              {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              {r.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
