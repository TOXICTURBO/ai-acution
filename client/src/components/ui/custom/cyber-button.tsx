import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const CyberButton = React.forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    
    let variantClasses = ""
    if (variant === "default") {
      variantClasses = "relative overflow-hidden bg-gradient-to-r from-cyan-900 to-cyan-700 text-cyan-50 hover:from-cyan-800 hover:to-cyan-600 border border-cyan-600 hover:shadow-lg hover:shadow-cyan-500/20 after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-cyan-500/10 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity"
    } else if (variant === "destructive") {
      variantClasses = "relative overflow-hidden bg-gradient-to-r from-red-900 to-red-700 text-red-50 hover:from-red-800 hover:to-red-600 border border-red-600 hover:shadow-lg hover:shadow-red-500/20 after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-red-500/10 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity"
    } else if (variant === "outline") {
      variantClasses = "border border-cyan-600 bg-black/20 backdrop-blur-sm hover:border-cyan-400 hover:bg-black/40 text-cyan-50 hover:text-cyan-200"
    } else if (variant === "ghost") {
      variantClasses = "hover:bg-accent hover:text-accent-foreground"
    } else if (variant === "link") {
      variantClasses = "text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300"
    }
    
    let sizeClasses = ""
    if (size === "default") {
      sizeClasses = "h-10 px-4 py-2"
    } else if (size === "sm") {
      sizeClasses = "h-9 rounded-md px-3"
    } else if (size === "lg") {
      sizeClasses = "h-11 rounded-md px-8"
    } else if (size === "icon") {
      sizeClasses = "h-10 w-10"
    }
    
    return (
      <Comp
        className={cn(baseClasses, variantClasses, sizeClasses, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
CyberButton.displayName = "CyberButton"

export { CyberButton }