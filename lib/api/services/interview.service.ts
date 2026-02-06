import apiClient from "../client";

export interface AssetPayload {
  type: string;
  name: string;
  country_code: string;
  is_active?: boolean;
  image: File;
}

export interface AssetResponse {
  id: string;
  type: string;
  name: string;
  country_code: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function createAsset(payload: AssetPayload) {
  const { image, ...fields } = payload;
  // Use apiClient.upload which appends fields to FormData
  return apiClient.upload<{ success?: boolean; message?: string; data?: AssetResponse }>(
    '/interviews/assets',
    image,
    'image',
    {
      type: fields.type,
      name: fields.name,
      country_code: fields.country_code,
      is_active: String(fields.is_active === undefined ? true : fields.is_active),
    }
  );
}

export interface AssetListFilters {
  asset_type?: string;
  country_code?: string;
  is_active?: boolean | null;
  search?: string;
}

export async function listAssets(filters?: AssetListFilters) {
  const params: Record<string, string> = {};
  if (filters?.asset_type) params['asset_type'] = filters.asset_type;
  if (filters?.country_code) params['country_code'] = filters.country_code;
  if (filters?.is_active !== undefined && filters?.is_active !== null) params['is_active'] = String(filters.is_active);
  if (filters?.search) params['search'] = filters.search;

  const res = await apiClient.get<{ success?: boolean; message?: string; data?: AssetResponse[] }>('/interviews/assets', { params });

  // Normalize response: API may return { data: [...] } or the array directly
  if (Array.isArray(res)) return res as any;
  if (res && Array.isArray((res as any).data)) return (res as any).data;
  // Fallback: empty array
  return [];
}

export default { createAsset, listAssets };
