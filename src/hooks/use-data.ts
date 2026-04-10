import { useState, useEffect } from "react";

export function useData<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // 🔥 USERS + DASHBOARD → Flask backend
    if (path.startsWith("users")  || path === "dashboard" || path === "riders") {
      fetch(`http://127.0.0.1:5001/${path}`)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch ${path}`);
          return res.json();
        })
        .then((json) => {
          setData(json);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });

    } else {
      // 🟡 OTHER PAGES → local JSON (UNCHANGED)
      fetch(`/data/${path}.json`)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch ${path}`);
          return res.json();
        })
        .then((json) => {
          setData(json);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }

  }, [path]);

  return { data, loading, error };
}