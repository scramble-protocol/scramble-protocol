import { type BitProgressProps, Progress } from "@/components/ui/8bit/progress";

interface ManaBarProps extends React.ComponentProps<"div"> {
  className?: string;
  props?: BitProgressProps;
  variant?: "retro" | "default";
  value?: number;
}

export default function HealthBar({
  className,
  props,
  variant,
  value,
}: ManaBarProps) {
  return (
    <Progress
      value={value}
      variant={variant}
      className={className}
      progressBg={props?.progressBg ?? "bg-red-500"}
    />
  );
}
