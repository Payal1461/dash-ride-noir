import { useMemo } from "react";
import { useData } from "@/hooks/use-data";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { Trophy } from "lucide-react";

interface Rider {
  rider_id: number; user_id: number; rating: number; total_trips: number; created_at: string; name: string; email: string; city: string;
}

export default function RidersPage() {
  const { data, loading, error } = useData<Rider[]>("riders");

  const topRiders = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => b.total_trips - a.total_trips).slice(0, 20);
  }, [data]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error || "Failed"} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Riders</h1>
      <p>Showing top {data.length} riders</p>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Top Riders</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topRiders.map((r, i) => (
            <div key={r.rider_id} className="rounded-xl border border-border bg-card p-5 animate-fade-in hover:border-primary/30 transition-colors shadow-lg shadow-black/20">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-card-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.city}</p>
                </div>
                {i < 3 && (
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary text-primary-foreground">#{i + 1}</span>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{r.total_trips}</p>
                  <p className="text-xs text-muted-foreground">trips</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-primary">{"★".repeat(Math.round(r.rating))}</p>
                  <p className="text-xs text-muted-foreground">{r.rating.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
