'use client';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type {
  MonthlyCount,
  FunnelStep,
  DepartmentSlice,
  ServiceSourceSlice,
  PeakHourData,
  PeakDayData,
  AnalyticsSummary,
} from '@/app/actions/analytics';
import {
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Clock,
  CalendarDays,
  PieChart as PieIcon,
  Layers,
} from 'lucide-react';

// ---------- colour palette ----------
// Concrete colours that are visible in both light and dark mode
const FUNNEL_COLORS = ['#2563eb', '#0ea5e9', '#8b5cf6', '#f59e0b', '#059669'];

const PIE_COLORS = ['#2563eb', '#059669', '#d97706', '#e11d48', '#7c3aed', '#0ea5e9'];

// ---------- shared card wrapper ----------
function ChartCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/40 bg-primary/5 transition-all hover:shadow-md">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-primary/10 p-2.5">
            <Icon className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---------- custom tooltip ----------
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
      <p className="text-sm font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// ---------- Monthly Trends (Area Chart) ----------
function MonthlyTrendsChart({ data }: { data: MonthlyCount[] }) {
  return (
    <ChartCard
      title="Submissions Over Time"
      description="Last 6 months"
      icon={TrendingUp}
    >
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradApp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradInq" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradCon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'currentColor' }} stroke="currentColor" className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} stroke="currentColor" className="text-muted-foreground" allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Legend wrapperStyle={{ color: 'var(--color-muted-foreground)' }} />
            <Area
              type="monotone"
              dataKey="applications"
              name="Applications"
              stroke="#2563eb"
              fill="url(#gradApp)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="inquiries"
              name="Inquiries"
              stroke="#059669"
              fill="url(#gradInq)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="contacts"
              name="Contacts"
              stroke="#d97706"
              fill="url(#gradCon)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// ---------- Conversion Funnel (Bar Chart) ----------
function ConversionFunnelChart({ data }: { data: FunnelStep[] }) {
  return (
    <ChartCard
      title="Application Funnel"
      description="Submitted → Hired conversion"
      icon={Target}
    >
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="stage" tick={{ fontSize: 12, fill: 'currentColor' }} stroke="currentColor" className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} stroke="currentColor" className="text-muted-foreground" allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="count" name="Applications" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// ---------- Department Breakdown (Pie Chart) ----------
function DepartmentPieChart({ data }: { data: DepartmentSlice[] }) {
  if (data.length === 0) {
    return (
      <ChartCard title="By Department" icon={PieIcon}>
        <p className="text-sm text-muted-foreground text-center py-12">
          No application data available
        </p>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Applications by Department" icon={PieIcon}>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="department"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              label={({ name, percent, x, y }) => (
                <text x={x} y={y} fill="currentColor" className="text-muted-foreground" fontSize={12} textAnchor="middle">
                  {`${name ?? ''} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                </text>
              )}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// ---------- Service Source Breakdown (Horizontal Bar) ----------
function ServiceSourceChart({ data }: { data: ServiceSourceSlice[] }) {
  if (data.length === 0) {
    return (
      <ChartCard title="Inquiries by Service" icon={Layers}>
        <p className="text-sm text-muted-foreground text-center py-12">
          No inquiry data available
        </p>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Inquiries by Service"
      description="Which services drive the most inquiries"
      icon={Layers}
    >
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 0 }}
          >
            <XAxis type="number" tick={{ fontSize: 12, fill: 'currentColor' }} stroke="currentColor" className="text-muted-foreground" allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="service"
              tick={{ fontSize: 11, fill: 'currentColor' }}
              stroke="currentColor"
              className="text-muted-foreground"
              width={120}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="count" name="Inquiries" fill="#059669" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// ---------- Peak Submission Hours / Days ----------
function PeakHoursChart({ data }: { data: PeakHourData[] }) {
  return (
    <ChartCard
      title="Peak Submission Hours"
      description="When submissions happen"
      icon={Clock}
    >
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'currentColor' }}
              stroke="currentColor"
              className="text-muted-foreground"
              interval={2}
            />
            <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} stroke="currentColor" className="text-muted-foreground" allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="count" name="Submissions" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

function PeakDaysChart({ data }: { data: PeakDayData[] }) {
  return (
    <ChartCard
      title="Peak Submission Days"
      description="Busiest days of the week"
      icon={CalendarDays}
    >
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'currentColor' }} stroke="currentColor" className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} stroke="currentColor" className="text-muted-foreground" allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="count" name="Submissions" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// ---------- Main Dashboard ----------
export function AnalyticsDashboard({ data }: { data: AnalyticsSummary }) {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Applications" value={data.totalApplications} icon={Users} />
        <KPICard label="Total Inquiries" value={data.totalInquiries} icon={BarChart3} />
        <KPICard label="Total Contacts" value={data.totalContacts} icon={Layers} />
        <KPICard
          label="Conversion Rate"
          value={`${data.conversionRate}%`}
          icon={Target}
          highlight={data.conversionRate > 0}
        />
      </div>

      {/* Row 1: Trends + Funnel */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlyTrendsChart data={data.monthlyTrends} />
        <ConversionFunnelChart data={data.funnel} />
      </div>

      {/* Row 2: Department Pie + Service Source */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DepartmentPieChart data={data.departmentBreakdown} />
        <ServiceSourceChart data={data.serviceSourceBreakdown} />
      </div>

      {/* Row 3: Peak Hours + Days */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PeakHoursChart data={data.peakHours} />
        <PeakDaysChart data={data.peakDays} />
      </div>
    </div>
  );
}

// ---------- small KPI card ----------
function KPICard({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/40 bg-primary/5 p-6 transition-all hover:shadow-md hover:bg-primary/10">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
        </div>
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Icon className="size-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
