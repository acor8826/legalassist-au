import axios from "axios";

const api = axios.create({
  baseURL: "https://api.bespoke-apothecaries.com.au", // always production API
  withCredentials: true, // keeps cookies/session if needed
});

export interface Folder {
  id: string;
  name: string;
  parents: string[];
  webViewLink: string;
}

export const getList = async (): Promise<Folder[]> => {
  console.log("Calling /list endpoint…");
  const res = await api.get<{ folders: Folder[] }>("list_all_folders");
  console.log("Response received:", res.data);
  return res.data.folders;
};

export default api;
