import { useState, useMemo } from "react";
import { useData } from "@/hooks/use-data";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Review {
  review_id: number; trip_id: number; reviewer_id: number; reviewee_id: number;
  rating: number; comment: string; reviewed_at: string;
  reviewer_name: string; reviewee_name: string; reviewer_role: string; reviewee_role: string;
}

export default function ReviewsPage() {
  const { data, loading, error } = useData<Review[]>("reviews");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 24;

  const filtered = useMemo(() => {
    if (!data) return [];
    if (ratingFilter === "all") return data;
    return data.filter((r) => r.rating === Number(ratingFilter));
  }, [data, ratingFilter]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error || "Failed"} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reviews</h1>
      <div className="flex gap-3 items-center">
        <Select value={ratingFilter} onValueChange={(v) => { setRatingFilter(v); setPage(0); }}>
          <SelectTrigger className="w-40 bg-secondary border-border"><SelectValue placeholder="Rating" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            {[5, 4, 3, 2, 1].map((n) => <SelectItem key={n} value={String(n)}>{"★".repeat(n)} ({n})</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} reviews</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paged.map((r) => (
          <div key={r.review_id} className="rounded-xl border border-border bg-card p-5 animate-fade-in hover:border-success/30 transition-colors shadow-lg shadow-black/20">
            <div className="text-lg mb-2">
              <span className="text-success">{"★".repeat(r.rating)}</span>
              <span className="text-muted-foreground/40">{"★".repeat(5 - r.rating)}</span>
            </div>
            <p className="text-sm text-card-foreground leading-relaxed">"{r.comment}"</p>
            <p className="text-xs text-muted-foreground mt-3">
              {r.reviewer_name} ({r.reviewer_role}) → {r.reviewee_name} ({r.reviewee_role})
            </p>
            <p className="text-xs text-muted-foreground mt-1">{new Date(r.reviewed_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground disabled:opacity-50 transition-colors">Prev</button>
        <span className="px-3 py-1.5">{page + 1} / {totalPages}</span>
        <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground disabled:opacity-50 transition-colors">Next</button>
      </div>
    </div>
  );
}
