import { useQuery } from "@tanstack/react-query";
import api from "../api";

const fetchLeetcodeProfile = async () => {
  const res = await api.get("/leetcode/profile");
  return res.data.data; // { profile, solved, contest, history }
};

export function useLeetcodeData() {
  return useQuery({
    queryKey: ["leetcodeProfile"],
    queryFn: fetchLeetcodeProfile,
    retry: false,
  });
}
