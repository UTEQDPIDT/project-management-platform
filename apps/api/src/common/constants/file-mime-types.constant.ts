// src/common/constants/file-mime-types.ts
export const FILE_MIME_TYPES = {
  IMAGES: ['image/png', 'image/jpeg'],

  DOCUMENTS: ['application/pdf'],

  OFFICE: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
} as const;
