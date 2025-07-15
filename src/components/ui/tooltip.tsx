import * as React from "react"
import { cn } from "@/lib/utils"

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

interface TooltipProps {
  children: React.ReactNode
}

const Tooltip = ({ children }: TooltipProps) => {
  return <>{children}</>
}

const TooltipTrigger = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { asChild?: boolean; children: React.ReactNode }
>(({ asChild, children, ...props }, ref) => {
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      ...props,
      ref,
    })
  }
  return (
    <span ref={ref as React.Ref<HTMLSpanElement>} {...props}>
      {children}
    </span>
  )
})
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { side?: "top" | "right" | "bottom" | "left" }
>(({ className, side = "top", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md",
      "absolute opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity",
      side === "top" && "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
      side === "bottom" && "top-full left-1/2 transform -translate-x-1/2 mt-2", 
      side === "left" && "right-full top-1/2 transform -translate-y-1/2 mr-2",
      side === "right" && "left-full top-1/2 transform -translate-y-1/2 ml-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }