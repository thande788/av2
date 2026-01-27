import {
  IconHeartHandshake,
  IconCalendarTime,
  IconStethoscope,
  IconCoin,
  IconSchool,
  IconUsers,
  IconShieldCheck,
  IconSunHigh,
} from "@tabler/icons-react";

/**
 * BenefitsSection component highlights the benefits of working at Angel Touch
 * Used on the careers landing page
 */

const benefits = [
  {
    icon: IconCoin,
    title: "Competitive Pay",
    description: "Above-market hourly rates with weekly pay and direct deposit options.",
  },
  {
    icon: IconCalendarTime,
    title: "Flexible Scheduling",
    description: "Choose shifts that work for your lifestyle. Full-time, part-time, and per diem available.",
  },
  {
    icon: IconStethoscope,
    title: "Health Benefits",
    description: "Comprehensive health, dental, and vision insurance for full-time employees.",
  },
  {
    icon: IconSchool,
    title: "Paid Training",
    description: "Ongoing education opportunities and tuition reimbursement programs.",
  },
  {
    icon: IconSunHigh,
    title: "Paid Time Off",
    description: "Vacation time, sick leave, and holiday pay to maintain work-life balance.",
  },
  {
    icon: IconUsers,
    title: "Supportive Team",
    description: "24/7 on-call support and a collaborative, family-oriented work environment.",
  },
  {
    icon: IconShieldCheck,
    title: "Job Security",
    description: "Growing company with consistent client base and stable employment.",
  },
  {
    icon: IconHeartHandshake,
    title: "Meaningful Work",
    description: "Make a real difference in the lives of seniors and families in your community.",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Why Work With Us?
          </h2>
          <p className="text-muted-foreground text-lg">
            At Angel Touch Homecare Services, we believe in taking care of those who care for others.
            Join our team and enjoy these benefits.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => {
            const IconComponent = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 rounded-full bg-icon/10 flex items-center justify-center mb-4">
                  <IconComponent className="h-6 w-6 text-icon" aria-hidden="true" />
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default BenefitsSection;
