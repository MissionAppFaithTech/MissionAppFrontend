/** Image types and size the backend accepts for a `PROFILE_PICTURE` upload. */
export const PROFILE_PICTURE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const PROFILE_PICTURE_MAX_BYTES = 5 * 1024 * 1024;
