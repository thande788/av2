import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, MessageSquare, Shield, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Client Portal | Angel Touch Homecare',
  description: 'Access your care schedule, communicate with caregivers, and manage your account.',
};

export default function ClientPortalPage() {
  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background illustration - Light mode */}
      <div className="absolute inset-0 dark:hidden">
        <Image
          src="/illustrations/boy-with-key.png"
          alt=""
          fill
          className="object-cover opacity-15"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/60" />
      </div>
      
      {/* Background illustration - Dark mode */}
      <div className="absolute inset-0 hidden dark:block">
        <Image
          src="/illustrations/boy-with-key-dark.png"
          alt=""
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container max-w-6xl mx-auto px-4 py-16">
        <div className="max-w-2xl space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Shield className="size-4" />
            Secure Client Portal
          </div>
          
          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Your Care,
              <br />
              <span className="bg-gradient-to-r from-primary via-accent-rose-deep to-accent-rose bg-clip-text text-transparent">
                One Click Away
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-lg">
              We&apos;re building a secure portal where you can manage schedules, 
              communicate with caregivers, and stay connected with your loved one&apos;s care.
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-3 pt-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur border border-border/50 text-sm">
              <Calendar className="size-4 text-primary" />
              View Schedule
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur border border-border/50 text-sm">
              <MessageSquare className="size-4 text-primary" />
              Message Caregivers
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur border border-border/50 text-sm">
              <Bell className="size-4 text-primary" />
              Real-time Updates
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/contact">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Get Notified at Launch
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-card/50 backdrop-blur">
                Explore Services
              </Button>
            </Link>
          </div>

          {/* Contact note */}
          <p className="text-sm text-muted-foreground pt-4 border-t border-border/50">
            Need assistance now? Call us at{' '}
            <a href="tel:+1234567890" className="text-primary font-medium hover:underline">
              (123) 456-7890
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
