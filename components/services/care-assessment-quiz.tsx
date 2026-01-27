/**
 * Care Assessment Quiz Component
 * 
 * Multi-step quiz to help families understand their care needs
 * and get personalized service recommendations.
 * 
 * @example
 * ```tsx
 * <CareAssessmentQuiz onComplete={(results) => console.log(results)} />
 * ```
 */

"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconArrowRight,
  IconArrowLeft,
  IconCheck,
  IconHeart,
  IconHome,
  IconUsers,
  IconClock,
  IconStethoscope,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

// Quiz question types
interface QuizOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface QuizQuestion {
  id: string;
  question: string;
  description?: string;
  type: "single" | "multiple";
  options: QuizOption[];
}

// Quiz results
export interface CareAssessmentResults {
  answers: Record<string, string | string[]>;
  recommendedServices: string[];
  careLevel: "light" | "moderate" | "comprehensive";
  estimatedHours: string;
  timestamp: Date;
}

// Quiz questions data
const quizQuestions: QuizQuestion[] = [
  {
    id: "relationship",
    question: "Who needs care?",
    description: "Help us understand who we'll be caring for.",
    type: "single",
    options: [
      { id: "self", label: "Myself", icon: <IconHeart className="size-5" /> },
      { id: "parent", label: "My Parent", icon: <IconUsers className="size-5" /> },
      { id: "spouse", label: "My Spouse", icon: <IconHeart className="size-5" /> },
      { id: "other", label: "Other Family Member", icon: <IconUsers className="size-5" /> },
    ],
  },
  {
    id: "living-situation",
    question: "What's the current living situation?",
    type: "single",
    options: [
      { id: "alone", label: "Living Alone", description: "No regular in-home support" },
      { id: "with-family", label: "With Family", description: "Family provides some care" },
      { id: "assisted", label: "Assisted Living", description: "In a care facility" },
      { id: "other", label: "Other Arrangement", description: "Different situation" },
    ],
  },
  {
    id: "care-needs",
    question: "What type of assistance is needed?",
    description: "Select all that apply.",
    type: "multiple",
    options: [
      { id: "personal-care", label: "Personal Care", description: "Bathing, dressing, grooming", icon: <IconHeart className="size-5" /> },
      { id: "mobility", label: "Mobility Assistance", description: "Walking, transfers, positioning", icon: <IconUsers className="size-5" /> },
      { id: "medication", label: "Medication Reminders", description: "Scheduling and reminders", icon: <IconStethoscope className="size-5" /> },
      { id: "meals", label: "Meal Preparation", description: "Cooking and nutrition", icon: <IconHome className="size-5" /> },
      { id: "housekeeping", label: "Light Housekeeping", description: "Cleaning, laundry, organizing", icon: <IconHome className="size-5" /> },
      { id: "companionship", label: "Companionship", description: "Social engagement, activities", icon: <IconHeart className="size-5" /> },
      { id: "transportation", label: "Transportation", description: "Appointments, errands", icon: <IconClock className="size-5" /> },
    ],
  },
  {
    id: "frequency",
    question: "How often is care needed?",
    type: "single",
    options: [
      { id: "few-hours", label: "A few hours per week", description: "1-10 hours" },
      { id: "part-time", label: "Part-time", description: "10-20 hours per week" },
      { id: "full-time", label: "Full-time", description: "20-40 hours per week" },
      { id: "live-in", label: "Live-in or 24/7", description: "Around the clock care" },
    ],
  },
  {
    id: "timeline",
    question: "When do you need care to begin?",
    type: "single",
    options: [
      { id: "immediately", label: "Immediately", description: "As soon as possible" },
      { id: "1-2-weeks", label: "Within 1-2 weeks", description: "Soon but not urgent" },
      { id: "1-month", label: "Within a month", description: "Planning ahead" },
      { id: "exploring", label: "Just exploring", description: "Researching options" },
    ],
  },
];

// Service recommendation logic
function getRecommendations(answers: Record<string, string | string[]>): Pick<CareAssessmentResults, "recommendedServices" | "careLevel" | "estimatedHours"> {
  const careNeeds = answers["care-needs"] as string[] || [];
  const frequency = answers["frequency"] as string;
  
  const recommendedServices: string[] = [];
  
  // Map care needs to services
  if (careNeeds.includes("personal-care") || careNeeds.includes("mobility")) {
    recommendedServices.push("Personal Care Assistance");
  }
  if (careNeeds.includes("companionship")) {
    recommendedServices.push("Companion Care");
  }
  if (careNeeds.includes("meals") || careNeeds.includes("housekeeping")) {
    recommendedServices.push("Homemaker Services");
  }
  if (careNeeds.includes("medication")) {
    recommendedServices.push("Medication Management");
  }
  if (careNeeds.includes("transportation")) {
    recommendedServices.push("Transportation Services");
  }
  
  // Determine care level
  let careLevel: "light" | "moderate" | "comprehensive" = "light";
  if (careNeeds.length >= 4 || frequency === "full-time" || frequency === "live-in") {
    careLevel = "comprehensive";
  } else if (careNeeds.length >= 2 || frequency === "part-time") {
    careLevel = "moderate";
  }
  
  // Estimate hours
  const hoursMap: Record<string, string> = {
    "few-hours": "4-10 hours/week",
    "part-time": "10-20 hours/week",
    "full-time": "20-40 hours/week",
    "live-in": "40+ hours/week",
  };
  
  return {
    recommendedServices: recommendedServices.length > 0 ? recommendedServices : ["Companion Care"],
    careLevel,
    estimatedHours: hoursMap[frequency] || "To be determined",
  };
}

interface CareAssessmentQuizProps {
  className?: string;
  onComplete?: (results: CareAssessmentResults) => void;
  onCancel?: () => void;
}

export function CareAssessmentQuiz({ className, onComplete, onCancel }: CareAssessmentQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isComplete, setIsComplete] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  const currentQuestion = quizQuestions[currentStep];
  const progress = ((currentStep + 1) / quizQuestions.length) * 100;
  const isLastQuestion = currentStep === quizQuestions.length - 1;
  
  const handleSelect = useCallback((optionId: string) => {
    const question = quizQuestions[currentStep];
    
    if (question.type === "single") {
      setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
    } else {
      // Multiple selection
      setAnswers((prev) => {
        const current = (prev[question.id] as string[]) || [];
        if (current.includes(optionId)) {
          return { ...prev, [question.id]: current.filter((id) => id !== optionId) };
        }
        return { ...prev, [question.id]: [...current, optionId] };
      });
    }
  }, [currentStep]);
  
  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      const recommendations = getRecommendations(answers);
      const results: CareAssessmentResults = {
        answers,
        ...recommendations,
        timestamp: new Date(),
      };
      setIsComplete(true);
      onComplete?.(results);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastQuestion, answers, onComplete]);
  
  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);
  
  const canProceed = useCallback(() => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === "multiple") {
      return Array.isArray(answer) && answer.length > 0;
    }
    return !!answer;
  }, [answers, currentQuestion]);
  
  // Results view
  if (isComplete) {
    const recommendations = getRecommendations(answers);
    
    return (
      <Card className={cn("w-full max-w-2xl mx-auto", className)}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <IconCheck className="size-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Your Care Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground mb-1">Care Level</p>
              <p className="font-semibold capitalize">{recommendations.careLevel}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground mb-1">Estimated Hours</p>
              <p className="font-semibold">{recommendations.estimatedHours}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">Recommended Services</p>
            <ul className="space-y-2">
              {recommendations.recommendedServices.map((service) => (
                <li key={service} className="flex items-center gap-2">
                  <IconCheck className="size-4 text-primary" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button className="flex-1" asChild>
              <a href="/contact">Schedule Free Consultation</a>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <a href="/services">Learn More About Services</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const questionContent = (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            Question {currentStep + 1} of {quizQuestions.length}
          </span>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
        <Progress value={progress} className="h-2 mb-4" />
        <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
        {currentQuestion.description && (
          <p className="text-muted-foreground">{currentQuestion.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className={cn(
          "grid gap-3",
          currentQuestion.options.length > 4 ? "sm:grid-cols-2" : "grid-cols-1"
        )}>
          {currentQuestion.options.map((option) => {
            const isSelected = currentQuestion.type === "multiple"
              ? ((answers[currentQuestion.id] as string[]) || []).includes(option.id)
              : answers[currentQuestion.id] === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-4 text-left transition-all",
                  "hover:border-primary/50 hover:bg-muted/50",
                  isSelected && "border-primary bg-primary/5 ring-1 ring-primary"
                )}
              >
                {option.icon && (
                  <span className={cn(
                    "mt-0.5 text-muted-foreground",
                    isSelected && "text-primary"
                  )}>
                    {option.icon}
                  </span>
                )}
                <div className="flex-1">
                  <p className="font-medium">{option.label}</p>
                  {option.description && (
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  )}
                </div>
                {isSelected && (
                  <IconCheck className="size-5 text-primary shrink-0" />
                )}
              </button>
            );
          })}
        </div>
        
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <IconArrowLeft className="size-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {isLastQuestion ? "See Results" : "Next"}
            <IconArrowRight className="size-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
  
  if (prefersReducedMotion) {
    return questionContent;
  }
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {questionContent}
      </motion.div>
    </AnimatePresence>
  );
}

export default CareAssessmentQuiz;
