import axios from "axios";

const api = axios.create({
  // On Vercel, VITE_API_URL can be left unset, and we'll default to /api
  baseURL: import.meta.env.VITE_API_URL || "/list",
});

export interface Folder {
  id: string;
  name: string;
  parents: string[];
  webViewLink: string;
}

export const getList = async (): Promise<Folder[]> => {
  console.log("Calling /list endpoint…");
  const res = await api.get<{ folders: Folder[] }>("/list");
  console.log("Response received:", res.data);
  return res.data.folders; // returns plain array
};

export default api;
