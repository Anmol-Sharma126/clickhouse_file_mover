
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";

export interface Step {
  id: string;
  name: string;
  description?: string;
  status: "upcoming" | "current" | "completed";
}

interface WorkflowStepperProps {
  steps: Step[];
  onStepClick?: (stepId: string) => void;
  allowNavigation?: boolean;
}

const WorkflowStepper = ({ 
  steps, 
  onStepClick,
  allowNavigation = false
}: WorkflowStepperProps) => {
  const handleStepClick = (stepId: string, status: string) => {
    if (allowNavigation && (status === "completed" || status === "current")) {
      onStepClick?.(stepId);
    }
  };

  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="space-y-3">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className={cn(
            "relative flex items-start",
            allowNavigation && (step.status === "completed" || step.status === "current") ? "cursor-pointer" : ""
          )}>
            <div 
              className="flex items-center"
              onClick={() => handleStepClick(step.id, step.status)}
            >
              <span className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center">
                {step.status === "completed" ? (
                  <>
                    <span className="absolute h-9 w-9 rounded-full bg-green-100" />
                    <Check className="h-5 w-5 text-green-600" aria-hidden="true" />
                  </>
                ) : step.status === "current" ? (
                  <>
                    <span className="absolute h-9 w-9 rounded-full border-2 border-blue-500" />
                    <span className="h-3 w-3 rounded-full bg-blue-500" />
                  </>
                ) : (
                  <>
                    <span className="absolute h-9 w-9 rounded-full border-2 border-gray-300" />
                    <span className="h-2 w-2 rounded-full bg-transparent" />
                  </>
                )}
              </span>
              <span className="ml-3">
                <span 
                  className={cn(
                    "block text-sm font-medium", 
                    step.status === "completed" ? "text-blue-600" : 
                    step.status === "current" ? "text-blue-600" : "text-gray-500"
                  )}
                >
                  {step.name}
                </span>
                {step.description && (
                  <span className="text-sm text-gray-500">{step.description}</span>
                )}
              </span>
            </div>
            
            {stepIdx !== steps.length - 1 && (
              <div className="absolute left-4 top-9 -ml-px mt-1.5 h-full w-px bg-gray-200" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default WorkflowStepper;
