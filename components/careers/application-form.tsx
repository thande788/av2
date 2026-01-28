"use client";

import { useActionState } from "react";
import { IconLoader2, IconSend, IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FileUpload } from "@/components/shared/file-upload";
import { submitApplication, type ApplicationFormState } from "@/app/actions/application";
import type { Job } from "@/types/job";
import type { Shift } from "@/types/application";

interface ApplicationFormProps {
  job: Job;
}

const initialState: ApplicationFormState = {
  success: false,
  message: "",
};

const shiftOptions: { value: Shift; label: string; time: string }[] = [
  { value: "morning", label: "Morning", time: "6am - 12pm" },
  { value: "afternoon", label: "Afternoon", time: "12pm - 6pm" },
  { value: "evening", label: "Evening", time: "6pm - 12am" },
  { value: "overnight", label: "Overnight", time: "12am - 6am" },
];

export function ApplicationForm({ job }: ApplicationFormProps) {
  const [state, formAction, isPending] = useActionState(submitApplication, initialState);

  // Show success state
  if (state.success && state.applicationId) {
    return (
      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mx-auto mb-4">
          <IconCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
          Application Submitted!
        </h2>
        <p className="text-green-700 dark:text-green-300 mb-4">
          {state.message}
        </p>
        <p className="text-sm text-green-600 dark:text-green-400">
          Application ID: <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded">{state.applicationId}</code>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      {/* Hidden fields */}
      <input type="hidden" name="jobId" value={job.id} />
      <input type="hidden" name="jobSlug" value={job.slug} />
      
      {/* Honeypot field - hidden from users, visible to bots */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input type="text" name="website" id="website" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Error Banner */}
      {state.message && !state.success && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
          <IconAlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">{state.message}</p>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              required
              placeholder="John"
              aria-invalid={!!state.errors?.firstName}
              aria-describedby={state.errors?.firstName ? "firstName-error" : undefined}
            />
            {state.errors?.firstName && (
              <p id="firstName-error" className="text-sm text-destructive">{state.errors.firstName[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              required
              placeholder="Doe"
              aria-invalid={!!state.errors?.lastName}
              aria-describedby={state.errors?.lastName ? "lastName-error" : undefined}
            />
            {state.errors?.lastName && (
              <p id="lastName-error" className="text-sm text-destructive">{state.errors.lastName[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="john.doe@example.com"
              aria-invalid={!!state.errors?.email}
              aria-describedby={state.errors?.email ? "email-error" : undefined}
            />
            {state.errors?.email && (
              <p id="email-error" className="text-sm text-destructive">{state.errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="(978) 555-1234"
              aria-invalid={!!state.errors?.phone}
              aria-describedby={state.errors?.phone ? "phone-error" : undefined}
            />
            {state.errors?.phone && (
              <p id="phone-error" className="text-sm text-destructive">{state.errors.phone[0]}</p>
            )}
          </div>
        </div>
      </section>

      <Separator />

      {/* Address (Optional) */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Address <span className="text-sm font-normal text-muted-foreground">(Optional)</span></h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              name="street"
              type="text"
              placeholder="123 Main Street, Apt 4"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                type="text"
                placeholder="Lowell"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                type="text"
                placeholder="MA"
                maxLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                name="zip"
                type="text"
                placeholder="01851"
                maxLength={10}
              />
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Experience */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Experience</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
            <Input
              id="yearsOfExperience"
              name="yearsOfExperience"
              type="number"
              min={0}
              max={50}
              required
              placeholder="2"
              aria-invalid={!!state.errors?.yearsOfExperience}
              aria-describedby={state.errors?.yearsOfExperience ? "yearsOfExperience-error" : undefined}
            />
            {state.errors?.yearsOfExperience && (
              <p id="yearsOfExperience-error" className="text-sm text-destructive">{state.errors.yearsOfExperience[0]}</p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="certifications">Certifications</Label>
            <Input
              id="certifications"
              name="certifications"
              type="text"
              placeholder="HHA, CNA, CPR, First Aid (comma-separated)"
            />
            <p className="text-xs text-muted-foreground">Enter your certifications separated by commas</p>
          </div>
        </div>
      </section>

      <Separator />

      {/* Availability */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Availability</h3>
        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Earliest Start Date *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                aria-invalid={!!state.errors?.startDate}
                aria-describedby={state.errors?.startDate ? "startDate-error" : undefined}
              />
              {state.errors?.startDate && (
                <p id="startDate-error" className="text-sm text-destructive">{state.errors.startDate[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoursPerWeek">Desired Hours Per Week *</Label>
              <Input
                id="hoursPerWeek"
                name="hoursPerWeek"
                type="number"
                min={1}
                max={60}
                required
                placeholder="30"
                aria-invalid={!!state.errors?.hoursPerWeek}
                aria-describedby={state.errors?.hoursPerWeek ? "hoursPerWeek-error" : undefined}
              />
              {state.errors?.hoursPerWeek && (
                <p id="hoursPerWeek-error" className="text-sm text-destructive">{state.errors.hoursPerWeek[0]}</p>
              )}
            </div>
          </div>

          {/* Shift Preferences */}
          <fieldset>
            <legend className="text-sm font-medium mb-3">
              Preferred Shifts * <span className="text-muted-foreground font-normal">(Select all that apply)</span>
            </legend>
            <div className="grid sm:grid-cols-2 gap-3">
              {shiftOptions.map((shift) => (
                <label
                  key={shift.value}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="checkbox"
                    name="shifts"
                    value={shift.value}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="font-medium">{shift.label}</span>
                    <span className="text-muted-foreground text-sm ml-2">({shift.time})</span>
                  </div>
                </label>
              ))}
            </div>
            {state.errors?.shifts && (
              <p className="text-sm text-destructive mt-2">{state.errors.shifts[0]}</p>
            )}
          </fieldset>
        </div>
      </section>

      <Separator />

      {/* Additional Information */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
        <div className="space-y-2">
          <Label htmlFor="additionalInfo">
            Tell us about yourself <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Textarea
            id="additionalInfo"
            name="additionalInfo"
            rows={4}
            placeholder="Share any additional information you'd like us to know about your experience, why you want to work with us, or any questions you have..."
          />
          <p className="text-xs text-muted-foreground">
            This is your opportunity to stand out! Tell us about your passion for caregiving, 
            relevant experience, or why you&apos;d be a great fit for our team.
          </p>
        </div>
      </section>

      <Separator />

      {/* Resume Upload */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Resume <span className="text-muted-foreground font-normal text-sm">(Recommended)</span></h3>
        <FileUpload
          type="resume"
          name="resumeUrl"
          error={state.errors?.resumeUrl?.[0]}
        />
      </section>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button 
          type="submit" 
          size="lg" 
          className="flex-1 sm:flex-none"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <IconLoader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <IconSend className="mr-2 h-5 w-5" />
              Submit Application
            </>
          )}
        </Button>
        <p className="text-sm text-muted-foreground self-center">
          * Required fields
        </p>
      </div>
    </form>
  );
}

export default ApplicationForm;
