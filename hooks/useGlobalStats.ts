"use client";

import { useEffect, useState } from "react";

export interface GlobalStats {
  totalMembers: number;
  totalMeals: number;
  totalBazar: number;
  totalPayments: number;
  mealRate: number;
}

const defaultStats: GlobalStats = {
  totalMembers: 0,
  totalMeals: 0,
  totalBazar: 0,
  totalPayments: 0,
  mealRate: 0,
};

export function useGlobalStats() {
  const [stats, setStats] = useState<GlobalStats>(defaultStats);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await fetch("/api/stats");
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalMembers: data.totalMembers || 0,
          totalMeals: data.totalMeals || 0,
          totalBazar: data.totalBazar || 0,
          totalPayments: data.totalPayments || 0,
          mealRate: data.mealRate || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching global stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loadingStats,
    refreshStats: fetchStats,
  };
}
