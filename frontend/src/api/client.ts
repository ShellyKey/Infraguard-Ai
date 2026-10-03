// ─── API Client ────────────────────────────────────────────────
// All backend HTTP calls live here. Nothing else in the app
// imports fetch/axios directly. If the backend URL or auth changes,
// only this file needs updating.

import type { BackendScanResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => 'Unknown error');
    throw new ApiError(res.status, `${res.status} ${res.statusText}: ${body}`);
  }

  return res.json() as Promise<T>;
}

/** Trigger a scan of the sample IaC project (GET /scan) */
export async function scanSampleProject(): Promise<BackendScanResponse> {
  return request<BackendScanResponse>('/scan');
}

/** Health check (GET /) */
export async function healthCheck(): Promise<{ message: string }> {
  return request<{ message: string }>('/');
}

export { ApiError };
