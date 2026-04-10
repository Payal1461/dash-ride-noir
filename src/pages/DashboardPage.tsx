import { useData } from "@/hooks/use-data";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { StatCard } from "@/components/StatCard";
import {
  Users, Car, UserCheck, MapPin, DollarSign,
  Navigation, Route, BarChart3
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";

function FloatingIcons() {
  return (
    <div className="relative flex items-center gap-3">
      <Car className="h-5 w-5 text-primary/90 animate-float-slow" />
      <MapPin className="h-4 w-4 text-accent-blue/90 animate-float-medium" />
      <Navigation className="h-4 w-4 text-accent-teal/90 animate-float-fast" />
    </div>
  );
}

function BackgroundDecorations() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <Route className="absolute top-12 right-16 h-20 w-20 text-primary/[0.08]" />
      <Car className="absolute bottom-20 left-10 h-16 w-16 text-accent-purple/[0.08]" />
      <MapPin className="absolute top-1/3 right-1/4 h-12 w-12 text-accent-blue/[0.08]" />
      <Navigation className="absolute bottom-10 right-1/3 h-14 w-14 text-accent-teal/[0.08]" />
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading, error } = useData<any>("dashboard");
  const { data: trips = [] } = useData<any[]>("trips");

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error || "Failed to load"} />;

  const getStatus = (s: string) => (s || "").toLowerCase();

  const summary = {
    totalUsers: data?.users || 0,
    totalDrivers: data?.drivers || 0,
    totalRiders: data?.riders || 0,
    totalTrips: data?.trips || trips.length,
    totalRevenue:
      data?.revenue ||
      trips.reduce((sum, t) => sum + (t.fare || 0), 0),

    completedTrips: trips.filter(t => getStatus(t.status) === "completed").length,
    cancelledTrips: trips.filter(t => getStatus(t.status) === "cancelled").length,
    inProgressTrips: trips.filter(t => getStatus(t.status) === "in_progress").length,
  };

  const statusData = [
    { name: "Completed", value: summary.completedTrips },
    { name: "Cancelled", value: summary.cancelledTrips },
    { name: "In Progress", value: summary.inProgressTrips },
  ];

  const COLORS = [
    "hsl(45,100%,51%)",
    "hsl(258,90%,66%)",
    "hsl(217,91%,60%)"
  ];

  return (
    <div className="space-y-8 relative">

      <BackgroundDecorations />

      {/* HEADER */}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Performance overview & analytics
          </p>
        </div>
        <FloatingIcons />
      </div>

      {/* CARDS */}
      <div className="relative z-10">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="h-3.5 w-3.5 text-primary" />
          Key Metrics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Users" value={summary.totalUsers} icon={Users} />
          <StatCard title="Total Drivers" value={summary.totalDrivers} icon={Car} />
          <StatCard title="Total Riders" value={summary.totalRiders} icon={UserCheck} />
          <StatCard title="Total Trips" value={summary.totalTrips} icon={MapPin} />
          <StatCard title="Total Revenue" value={`$${summary.totalRevenue}`} icon={DollarSign} />
        </div>
      </div>

      {/* ✅ FIXED PIE CHART */}
      <div className="relative z-10">
        <div className="rounded-xl glass-card p-6 flex flex-col items-center overflow-hidden">

          <h3 className="text-sm font-semibold mb-6 self-start">
            Trip Status Breakdown
          </h3>

          {/* IMPORTANT FIX */}
          <div className="w-full h-[400px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={5}
                  label
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* EXTRA INFO */}
          <div className="grid grid-cols-3 gap-6 mt-6 w-full text-center">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-lg font-bold">{summary.completedTrips}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cancelled</p>
              <p className="text-lg font-bold">{summary.cancelledTrips}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-lg font-bold">{summary.inProgressTrips}</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}