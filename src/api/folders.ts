export async function listAllFolders(pageSize: number = 100, pageToken?: string) {
  const params = new URLSearchParams({ page_size: String(pageSize) });
  if (pageToken) params.append("page_token", pageToken);

  const res = await fetch(`/folders/list?${params.toString()}`, {
    headers: {
      "accept": "application/json",
      // If your backend enforces tenant headers:
      // "x-tenant-id": "default",
      // "x-case-id": "optional-case"
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch folders: ${res.statusText}`);
  }

  return res.json();
}
