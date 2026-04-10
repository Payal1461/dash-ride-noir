import { useState, useMemo } from "react";
import { useData } from "@/hooks/use-data";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronUp, ChevronDown, Car } from "lucide-react";

interface Trip {
  trip_id: number; rider_id: number; driver_id: number; pickup_location_id: number; dropoff_location_id: number;
  requested_at: string; started_at: string; completed_at: string | null; status: string;
  distance_km: number; duration_mins: number; base_fare: number; surge_multiplier: number;
  total_fare: number; payment_method: string;
  rider_name: string; driver_name: string; pickup_zone: string; pickup_city: string; dropoff_zone: string; dropoff_city: string;
}

const PAGE_SIZE = 20;

export default function TripsPage() {
  const { data, loading, error } = useData<Trip[]>("trips");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortKey, setSortKey] = useState<string>("trip_id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Trip | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    let result = data as any[];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((t: Trip) => String(t.trip_id).includes(s));
    }
    if (statusFilter !== "all") result = result.filter((t: Trip) => t.status === statusFilter);
    if (paymentFilter !== "all") result = result.filter((t: Trip) => t.payment_method === paymentFilter);
    result = [...result].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [data, search, statusFilter, paymentFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };
  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3 inline" /> : <ChevronDown className="h-3 w-3 inline" />;
  };

  const statusColor = (s: string) => {
    if (s === "completed") return "bg-primary text-primary-foreground";
    if (s === "cancelled") return "bg-secondary text-muted-foreground";
    return "bg-accent text-foreground";
  };

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error || "Failed"} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Trips</h1>
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search Trip ID..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="w-48 bg-secondary border-border focus-visible:ring-primary" />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-40 bg-secondary border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={(v) => { setPaymentFilter(v); setPage(0); }}>
          <SelectTrigger className="w-40 bg-secondary border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="wallet">Wallet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border overflow-hidden shadow-lg shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary text-muted-foreground">
                {[["trip_id","ID"],["rider_name","Rider"],["driver_name","Driver"],["pickup_zone","Pickup"],["dropoff_zone","Dropoff"],["status","Status"],["distance_km","Dist(km)"],["total_fare","Fare"],["payment_method","Payment"]].map(([key,label]) => (
                  <th key={key} className="px-4 py-3 text-left font-medium cursor-pointer hover:text-primary transition-colors whitespace-nowrap" onClick={() => toggleSort(key)}>
                    {label} <SortIcon col={key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((t) => (
                <tr key={t.trip_id} className="border-t border-border hover:bg-secondary/60 transition-colors cursor-pointer" onClick={() => setSelected(t)}>
                  <td className="px-4 py-3 font-mono text-xs">
                    <span className="inline-flex items-center gap-1.5">
                      <Car className="h-3 w-3 text-primary opacity-60" />
                      {t.trip_id}
                    </span>
                  </td>
                  <td className="px-4 py-3">{t.rider_name}</td>
                  <td className="px-4 py-3">{t.driver_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.pickup_zone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.dropoff_zone}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(t.status)}`}>{t.status}</span></td>
                  <td className="px-4 py-3 text-right">{t.distance_km?.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right font-medium">${t.total_fare?.toFixed(2)}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{t.payment_method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{filtered.length} trips</span>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground disabled:opacity-50 transition-colors">Prev</button>
          <span className="px-3 py-1.5">{page + 1} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground disabled:opacity-50 transition-colors">Next</button>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-card border-border max-w-lg shadow-xl shadow-black/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-4 w-4 text-primary" />
              Trip #{selected?.trip_id}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground">Rider</p><p className="font-medium">{selected.rider_name}</p></div>
                <div><p className="text-muted-foreground">Driver</p><p className="font-medium">{selected.driver_name}</p></div>
                <div><p className="text-muted-foreground">Pickup</p><p className="font-medium">{selected.pickup_zone}, {selected.pickup_city}</p></div>
                <div><p className="text-muted-foreground">Dropoff</p><p className="font-medium">{selected.dropoff_zone}, {selected.dropoff_city}</p></div>
              </div>
              <div className="border-t border-border pt-4">
                <h4 className="font-medium mb-2">Timestamps</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Requested:</span> {selected.requested_at}</div>
                  <div><span className="text-muted-foreground">Started:</span> {selected.started_at}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Completed:</span> {selected.completed_at || "N/A"}</div>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <h4 className="font-medium mb-2">Fare Breakdown</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Base Fare</span><span>${selected.base_fare?.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Surge Multiplier</span><span>{selected.surge_multiplier}x</span></div>
                  <div className="flex justify-between font-medium text-sm border-t border-border pt-2 mt-2"><span>Total</span><span className="text-primary">${selected.total_fare?.toFixed(2)}</span></div>
                </div>
              </div>
              <div className="border-t border-border pt-4 grid grid-cols-3 gap-3 text-xs">
                <div><span className="text-muted-foreground">Distance</span><p className="font-medium">{selected.distance_km?.toFixed(1)} km</p></div>
                <div><span className="text-muted-foreground">Duration</span><p className="font-medium">{selected.duration_mins} min</p></div>
                <div><span className="text-muted-foreground">Payment</span><p className="font-medium capitalize">{selected.payment_method}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
