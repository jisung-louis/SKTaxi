export interface PaginationParams {
  page?: number;
  size?: number;
  cursor?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export type FilterOptions<T> = Partial<T>;

export interface BatchResult {
  success: number;
  failed: number;
  errors?: Array<{ index: number; error: string }>;
}
