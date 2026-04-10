import { useState, useMemo } from "react";
import { useData } from "@/hooks/use-data";
import { LoadingState, ErrorState } from "@/components/StatusStates";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronUp, ChevronDown } from "lucide-react";

interface User {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  date_joined: string;
  is_driver: number;
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [finalSearch, setFinalSearch] = useState(""); // ✅ used for backend
  const [cityFilter, setCityFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortKey, setSortKey] = useState<keyof User>("user_id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  // ✅ FIX: use finalSearch (NOT debouncedSearch)
  const query = useMemo(() => {
    return `users?search=${encodeURIComponent(finalSearch)}&city=${cityFilter}&role=${roleFilter}&sort=${sortKey}&dir=${sortDir}&page=${page}`;
  }, [finalSearch, cityFilter, roleFilter, sortKey, sortDir, page]);

  const { data, loading, error } = useData<User[]>(query);

  const cities = [...new Set((data || []).map((u) => u.city))];

  const toggleSort = (key: keyof User) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: keyof User }) => {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 inline" />
    ) : (
      <ChevronDown className="h-3 w-3 inline" />
    );
  };

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error || "Failed"} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>

      {/* 🔍 Filters */}
      <div className="flex flex-wrap gap-3">

        {/* ✅ FIXED SEARCH (button based) */}
        <div className="flex gap-2">
          <Input
            placeholder="Search full name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />

          <button
            onClick={() => {
              setFinalSearch(search); // ✅ trigger backend
              setPage(0);
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Search
          </button>
        </div>

        <Select
          value={cityFilter}
          onValueChange={(v) => {
            setCityFilter(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={roleFilter}
          onValueChange={(v) => {
            setRoleFilter(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="driver">Driver</SelectItem>
            <SelectItem value="rider">Rider</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 📊 Table */}
      <div className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary">
                {([
                  ["name", "Name"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["city", "City"],
                  ["date_joined", "Joined"],
                  ["is_driver", "Role"],
                ] as [keyof User, string][]).map(([key, label]) => (
                  <th
                    key={key}
                    className="px-4 py-3 text-left cursor-pointer"
                    onClick={() => toggleSort(key)}
                  >
                    {label} <SortIcon col={key} />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((u) => (
                <tr key={u.user_id} className="border-t">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.phone}</td>
                  <td className="px-4 py-3">{u.city}</td>
                  <td className="px-4 py-3">{u.date_joined}</td>
                  <td className="px-4 py-3">
                    {u.is_driver ? "Driver" : "Rider"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📄 Pagination */}
      <div className="flex justify-between">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          Prev
        </button>

        <span>Page {page + 1}</span>

        <button onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}