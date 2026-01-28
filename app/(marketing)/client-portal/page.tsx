import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, Calendar, MessageSquare, Shield } from 'lucide-react';

export const metadata = {
  title: 'Client Portal | Angel Touch Homecare',
  description: 'Access your care schedule, communicate with caregivers, and manage your account.',
};

export default function ClientPortalPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-rose/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
        {/* Illustration */}
        <div className="relative mx-auto w-64 h-64 md:w-80 md:h-80">
          {/* Light mode image */}
          <Image
            src="/illustrations/boy-with-key.png"
            alt="Person holding a key - Client Portal coming soon"
            fill
            className="object-contain drop-shadow-lg dark:hidden"
            priority
          />
          {/* Dark mode image */}
          <Image
            src="/illustrations/boy-with-key-dark.png"
            alt="Person holding a key - Client Portal coming soon"
            fill
            className="object-contain drop-shadow-lg hidden dark:block"
            priority
          />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-rose/15 text-accent-rose-deep text-sm font-medium">
            <Shield className="size-4" />
            Secure Portal
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Client Portal
            <span className="block text-2xl md:text-3xl font-normal text-muted-foreground mt-2">
              Coming Soon
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            We're building a secure space for you and your family to stay connected with your care team.
          </p>
        </div>

        {/* Features preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/50 border border-border/50">
            <Calendar className="size-8 text-primary" />
            <span className="text-sm font-medium">View Schedule</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/50 border border-border/50">
            <MessageSquare className="size-8 text-primary" />
            <span className="text-sm font-medium">Message Caregivers</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/50 border border-border/50">
            <Bell className="size-8 text-primary" />
            <span className="text-sm font-medium">Care Updates</span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/contact">
            <Button className="gap-2">
              Contact Us for Updates
            </Button>
          </Link>
        </div>

        {/* Note */}
        <p className="text-sm text-muted-foreground pt-8">
          Existing clients: Please contact us at{' '}
          <a href="tel:+1234567890" className="text-primary hover:underline">
            (123) 456-7890
          </a>{' '}
          for care coordination.
        </p>
      </div>
    </div>
  );
}
