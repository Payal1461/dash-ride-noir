import { useState, useMemo } from "react";
import { useData } from "@/hooks/use-data";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { StatCard } from "@/components/StatCard";
import { DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface PaymentsData {
  payments: { payment_id: number; trip_id: number; amount: number; method: string; status: string; paid_at: string }[];
  revenueByMethod: { method: string; total: number; count: number }[];
  revenueByMonth: { month: string; revenue: number }[];
}

export default function PaymentsPage() {
  const { data, loading, error } = useData<PaymentsData>("payments");
  const [methodFilter, setMethodFilter] = useState("all");

  const totalRevenue = useMemo(() => {
    if (!data) return 0;
    return data.revenueByMethod.reduce((s, r) => s + r.total, 0);
  }, [data]);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.revenueByMonth;
  }, [data]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error || "Failed"} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} />
        {data.revenueByMethod.map((r) => (
          <StatCard key={r.method} title={`${r.method.charAt(0).toUpperCase() + r.method.slice(1)} Revenue`} value={`$${r.total.toLocaleString()}`} icon={DollarSign} />
        ))}
      </div>

      <div className="flex gap-3">
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-40 bg-secondary border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="wallet">Wallet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 animate-fade-in shadow-lg shadow-black/20">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Revenue Over Time</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <XAxis dataKey="month" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "hsl(0,0%,12%)", border: "1px solid hsl(0,0%,20%)", borderRadius: 8, color: "#fff" }} />
            <Bar dataKey="revenue" fill="hsl(48,96%,53%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
