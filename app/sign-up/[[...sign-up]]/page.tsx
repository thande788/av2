import { SignUp } from '@clerk/nextjs';
import { Heart, Shield, Users, Clock } from 'lucide-react';

export const metadata = {
  title: 'Create Account | Angel Touch Homecare',
  description: 'Join Angel Touch Homecare to access your care portal, manage appointments, and connect with your care team.',
};

export default function SignUpPage() {
  return (
    <div className='grid min-h-[80vh] flex-1 lg:grid-cols-2'>
      {/* Benefits Panel */}
      <div className='hidden flex-1 items-center justify-end bg-primary/5 p-6 md:p-10 lg:flex'>
        <div className='max-w-md space-y-8'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              Welcome to Angel Touch Homecare
            </h1>
            <p className='text-muted-foreground mt-2'>
              Create an account to access your personalized care portal.
            </p>
          </div>

          <ul className='space-y-6'>
            <li className='flex gap-4'>
              <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10'>
                <Heart className='size-5 text-primary' />
              </div>
              <div>
                <p className='font-semibold'>Compassionate Care</p>
                <p className='text-muted-foreground mt-1 text-sm'>
                  Our caregivers are carefully selected and trained to provide personalized, dignified care.
                </p>
              </div>
            </li>
            <li className='flex gap-4'>
              <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10'>
                <Users className='size-5 text-primary' />
              </div>
              <div>
                <p className='font-semibold'>Care Team Access</p>
                <p className='text-muted-foreground mt-1 text-sm'>
                  Stay connected with your care team and receive updates on your loved one&apos;s care.
                </p>
              </div>
            </li>
            <li className='flex gap-4'>
              <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10'>
                <Clock className='size-5 text-primary' />
              </div>
              <div>
                <p className='font-semibold'>Flexible Scheduling</p>
                <p className='text-muted-foreground mt-1 text-sm'>
                  Manage appointments and care schedules from anywhere, anytime.
                </p>
              </div>
            </li>
            <li className='flex gap-4'>
              <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10'>
                <Shield className='size-5 text-primary' />
              </div>
              <div>
                <p className='font-semibold'>Secure & Private</p>
                <p className='text-muted-foreground mt-1 text-sm'>
                  Your information is protected with enterprise-grade security and HIPAA compliance.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Sign Up Form */}
      <div className='flex flex-1 items-center justify-center p-6 md:p-10 lg:justify-start'>
        <SignUp
          forceRedirectUrl='/portals'
          appearance={{
            elements: {
              rootBox: 'mx-auto lg:mx-0',
              card: 'shadow-none',
            },
          }}
        />
      </div>
    </div>
  );
}
