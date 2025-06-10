import {
  Tooltip as TooltipPrimitive,
  TooltipTrigger as TooltipPrimitiveTrigger,
  TooltipContent as TooltipPrimitiveContent,
} from "@/components/ui/tooltip";
import type React from "react";

interface TooltipProps
  extends Omit<
    React.ComponentProps<typeof TooltipPrimitiveContent>,
    "content"
  > {
  children: React.ReactNode;
  content: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Tooltip({
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: TooltipProps) {
  return (
    <TooltipPrimitive
      data-slot="tooltip"
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      delayDuration={0}
      {...props}
    >
      <TooltipPrimitiveTrigger className="cursor-default">
        {children}
      </TooltipPrimitiveTrigger>
      <TooltipPrimitiveContent>{content}</TooltipPrimitiveContent>
    </TooltipPrimitive>
  );
}
