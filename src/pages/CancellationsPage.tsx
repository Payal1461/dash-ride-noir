import { useState, useMemo } from "react";
import { useData } from "@/hooks/use-data";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface CancellationsData {
  cancellations: { cancel_id: number; trip_id: number; cancelled_by: string; reason: string; cancelled_at: string; rider_name: string; driver_name: string }[];
  cancelByMonth: { month: string; count: number }[];
}

export default function CancellationsPage() {
  const { data, loading, error } = useData<CancellationsData>("cancellations");
  const [byFilter, setByFilter] = useState("all");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const filtered = useMemo(() => {
    if (!data) return [];
    if (byFilter === "all") return data.cancellations;
    return data.cancellations.filter((c) => c.cancelled_by === byFilter);
  }, [data, byFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error || "Failed"} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cancellations</h1>

      <div className="flex gap-3">
        <Select value={byFilter} onValueChange={(v) => { setByFilter(v); setPage(0); }}>
          <SelectTrigger className="w-40 bg-secondary border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="driver">By Driver</SelectItem>
            <SelectItem value="rider">By Rider</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground self-center">{filtered.length} cancellations</span>
      </div>

      <div className="rounded-xl border border-destructive/20 bg-card p-6 animate-fade-in shadow-lg shadow-black/20">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Cancellation Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.cancelByMonth}>
            <XAxis dataKey="month" tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "hsl(0,0%,55%)", fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "hsl(0,0%,12%)", border: "1px solid hsl(0,72%,51%)", borderRadius: 8, color: "#fff" }} />
            <Bar dataKey="count" fill="hsl(0,72%,51%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-border overflow-hidden shadow-lg shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Trip ID</th>
                <th className="px-4 py-3 text-left font-medium">Cancelled By</th>
                <th className="px-4 py-3 text-left font-medium">Reason</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((c) => (
                <tr key={c.cancel_id} className="border-t border-border hover:bg-secondary/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{c.trip_id}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.cancelled_by === "driver" ? "bg-destructive/20 text-destructive" : "bg-destructive/10 text-destructive/80"}`}>
                      {c.cancelled_by}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.reason}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(c.cancelled_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground disabled:opacity-50 transition-colors">Prev</button>
        <span className="px-3 py-1.5">{page + 1} / {totalPages}</span>
        <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground disabled:opacity-50 transition-colors">Next</button>
      </div>
    </div>
  );
}
