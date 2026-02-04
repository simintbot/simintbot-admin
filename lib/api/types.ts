export type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface RequestOptions extends RequestInit {
  loadingMessage?: string;
  successMessage?: string;
  hideError?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  status: number;
}
