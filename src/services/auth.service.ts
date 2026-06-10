import axios from "@/lib/axios";

export async function login(data: unknown) {
  return axios.post("/login", data);
}