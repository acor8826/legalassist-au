import axios from "axios";

// Base API instance
const api = axios.create({
  baseURL: "http://35.225.132.16:8000", // your FastAPI backend
  headers: {
    "accept": "application/json",
  },
});

export async function listAllFolders(pageSize: number = 100, pageToken?: string) {
  try {
    const response = await api.get("/folders/list", {
      params: {
        page_size: pageSize,
        page_token: pageToken,
      },
    });
    return response.data;
  } catch (err) {
    console.error("Failed to fetch folders", err);
    throw err;
  }
}
