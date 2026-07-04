import { useQuery } from "@tanstack/react-query";
import api from "../api";

const fetchAnalytics = async () => {
  const res = await api.get("/analytics");
  return res.data.data;
};

export function useAnalyticsData() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
