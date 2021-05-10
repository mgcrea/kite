export const SUPPORTS_ABORT_CONTROLLER = typeof globalThis.AbortController === 'function';
export const SUPPORTS_STREAM = typeof globalThis.ReadableStream === 'function';
export const SUPPORTS_FORM_DATA = typeof globalThis.FormData === 'function';
export const MAX_SAFE_TIMEOUT = 2147483647; // (2 ^ 32) / 2 - 1
