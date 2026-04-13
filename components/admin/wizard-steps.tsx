import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface Step {
  number: number;
  title: string;
  description?: string;
}

interface WizardStepsProps {
  steps: Step[];
  currentStep: number;
}

export function WizardSteps({ steps, currentStep }: WizardStepsProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <ol className="flex items-start gap-4">
        {steps.map((step, idx) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;
          const isLast = idx === steps.length - 1;

          return (
            <li
              key={step.number}
              className={cn(
                "flex flex-1 items-start gap-3",
                !isLast && "relative"
              )}
            >
              {/* Circle */}
              <div className="flex shrink-0 flex-col items-center">
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full border-2 font-semibold transition-colors",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    isActive &&
                      "border-primary bg-background text-primary shadow-[0_0_0_4px_rgba(0,66,109,0.08)]",
                    !isCompleted &&
                      !isActive &&
                      "border-border bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-4" strokeWidth={3} />
                  ) : (
                    <span className="text-sm">{step.number}</span>
                  )}
                </div>
              </div>

              {/* Label + connector */}
              <div className="flex min-w-0 flex-1 flex-col pt-1">
                <div className="flex items-center gap-3">
                  <p
                    className={cn(
                      "text-[11px] font-bold uppercase tracking-[0.1em]",
                      isActive || isCompleted
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    Step {step.number}
                  </p>
                  {!isLast && (
                    <div
                      className={cn(
                        "h-px flex-1 transition-colors",
                        isCompleted ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                </div>
                <p
                  className={cn(
                    "mt-1 text-sm font-semibold leading-tight",
                    isActive || isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {step.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
