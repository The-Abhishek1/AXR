import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export async function getProcesses() {
  const res = await api.get("/processes");
  return res.data;
}