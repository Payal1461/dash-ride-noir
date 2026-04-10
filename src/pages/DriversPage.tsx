import { useState, useMemo } from "react";
import { useData } from "@/hooks/use-data";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronUp, ChevronDown, Car } from "lucide-react";

interface Driver {
  driver_id: number; user_id: number; vehicle_make: string; vehicle_model: string; vehicle_year: number;
  license_plate: string; rating: number; join_date: string; is_active: number; name: string; city: string;
}

const PAGE_SIZE = 20;

export default function DriversPage() {
  const { data, loading, error } = useData<Driver[]>("drivers");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortKey, setSortKey] = useState<string>("driver_id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!data) return [];
    let result = data as any[];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(s) || d.license_plate.toLowerCase().includes(s));
    }
    if (activeFilter !== "all") result = result.filter((d) => (activeFilter === "active" ? d.is_active === 1 : d.is_active === 0));
    result = [...result].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [data, search, activeFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3 inline" /> : <ChevronDown className="h-3 w-3 inline" />;
  };

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error || "Failed"} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Drivers</h1>
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search name or plate..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="w-64 bg-secondary border-border focus-visible:ring-primary" />
        <Select value={activeFilter} onValueChange={(v) => { setActiveFilter(v); setPage(0); }}>
          <SelectTrigger className="w-40 bg-secondary border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border overflow-hidden shadow-lg shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary text-muted-foreground">
                {[["name", "Name"], ["vehicle_make", "Vehicle"], ["license_plate", "Plate"], ["rating", "Rating"], ["is_active", "Status"]].map(([key, label]) => (
                  <th key={key} className="px-4 py-3 text-left font-medium cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort(key)}>
                    {label} <SortIcon col={key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((d) => (
                <tr key={d.driver_id} className="border-t border-border hover:bg-secondary/60 transition-colors">
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Car className="h-3.5 w-3.5 text-primary opacity-60" />
                      {d.vehicle_year} {d.vehicle_make} {d.vehicle_model}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">{d.license_plate}</td>
                  <td className="px-4 py-3">
                    <span className="text-primary">{"★".repeat(Math.round(d.rating))}</span>
                    <span className="text-muted-foreground ml-1 text-xs">{d.rating.toFixed(1)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${d.is_active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {d.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{filtered.length} drivers</span>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground disabled:opacity-50 transition-colors">Prev</button>
          <span className="px-3 py-1.5">{page + 1} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground disabled:opacity-50 transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
}
