const FILE_TYPES = {
  ".pdf": { label: "PDF", contentType: "application/pdf" },
  ".png": { label: "PNG", contentType: "image/png" },
  ".jpg": { label: "JPEG", contentType: "image/jpeg" },
  ".jpeg": { label: "JPEG", contentType: "image/jpeg" },
  ".doc": { label: "DOC", contentType: "application/msword" },
  ".docx": {
    label: "DOCX",
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  ".xls": { label: "XLS", contentType: "application/vnd.ms-excel" },
  ".xlsx": {
    label: "XLSX",
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
};

export const ALLOWED_EXTENSIONS = Object.keys(FILE_TYPES);

export function isAllowedExtension(ext) {
  return Object.prototype.hasOwnProperty.call(FILE_TYPES, ext.toLowerCase());
}

// ext should include the leading dot, e.g. ".pdf"
export function getFileMeta(ext) {
  const meta = FILE_TYPES[ext.toLowerCase()];
  if (!meta) {
    return { label: "FILE", contentType: "application/octet-stream" };
  }
  return meta;
}

export default FILE_TYPES;