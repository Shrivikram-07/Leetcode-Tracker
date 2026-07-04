import { useQuery } from "@tanstack/react-query";
import api from "../api";

const fetchDashboardUser = async () => {
  const res = await api.get("/users/dashboard");
  return res.data;
};

const fetchProblems = async () => {
  const res = await api.get("/problems");
  return res.data;
};

export function useDashboardUser() {
  return useQuery({
    queryKey: ["dashboardUser"],
    queryFn: fetchDashboardUser,
  });
}

export function useProblems() {
  return useQuery({
    queryKey: ["problems"],
    queryFn: fetchProblems,
  });
}
