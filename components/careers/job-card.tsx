"use client";

import Link from "next/link";
import { IconBriefcase, IconMapPin, IconClock, IconCurrencyDollar } from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatSalaryRange, formatJobType, formatDepartment } from "@/data/jobs";
import type { JobCardProps } from "@/types/job";

/**
 * JobCard component displays a summary of a job listing
 * Used on the careers landing page to show available positions
 */
export function JobCard({ job }: JobCardProps) {
  const departmentColors: Record<string, string> = {
    caregiving: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    nursing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    administrative: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  };

  const typeColors: Record<string, string> = {
    "full-time": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    "part-time": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    "per-diem": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  };

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge 
            variant="secondary" 
            className={departmentColors[job.department]}
          >
            {formatDepartment(job.department)}
          </Badge>
          <Badge 
            variant="secondary"
            className={typeColors[job.type]}
          >
            {formatJobType(job.type)}
          </Badge>
        </div>
        <CardTitle className="text-xl font-semibold">
          <Link 
            href={`/careers/${job.slug}`}
            className="hover:text-primary transition-colors"
          >
            {job.title}
          </Link>
        </CardTitle>
        <CardDescription className="sr-only">
          {job.title} position at Angel Touch Homecare Services
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <IconMapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="text-sm">{job.location}</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <IconCurrencyDollar className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="text-sm">{formatSalaryRange(job)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <IconClock className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="text-sm">
            Posted {new Date(job.postedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4">
        <Button asChild className="w-full">
          <Link href={`/careers/${job.slug}`}>
            <IconBriefcase className="mr-2 h-4 w-4" aria-hidden="true" />
            View Details & Apply
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default JobCard;
