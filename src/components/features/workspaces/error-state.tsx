/**
 * ErrorState Component
 * Displayed when an error occurs while fetching data
 */

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorState({
  message = "Failed to load projects. Please try again.",
  onRetry
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <h3 className="text-xl font-bold mb-2">Something went wrong</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        {message}
      </p>
      <Button onClick={onRetry} variant="outline">
        Try Again
      </Button>
    </div>
  );
}
