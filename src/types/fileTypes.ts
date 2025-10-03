// src/types/fileTypes.ts
export interface FileObject {
  id: string;
  name: string;
  mime_type: string;
  drive_file_id?: string;
  drive_web_view_link?: string;
  [key: string]: any;
}
